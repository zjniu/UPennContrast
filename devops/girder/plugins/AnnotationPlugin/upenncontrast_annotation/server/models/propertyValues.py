from girder.models.model_base import AccessControlledModel
from girder.exceptions import AccessException, ValidationException
from girder.constants import AccessType
from girder import events

from bson.objectid import ObjectId
import jsonschema


class PropertySchema:
    annotationPropertySchema = {
        '$schema': 'http://json-schema.org/schema#',
        'id': '/girder/plugins/upenncontrast_annotation/models/annotation',
        'type': 'object',
        'properties': {
            'annotationId': {
                'bsonType': 'objectId',
            },
            'datasetId': {
                'type': 'string'
            },
            'values': {
                'type': 'object',
                'additionalProperties': {'type': 'number'}
            }
        },
        # 'additionalProperties': False
    }


class AnnotationPropertyValues(AccessControlledModel):
    validator = jsonschema.Draft4Validator(
        PropertySchema.annotationPropertySchema
    )

    def annotationsRemovedEvent(self, event):
        # Clean property values orphaned by the deletion of the annotations
        annotationStringIds = event.info
        query = {
            'annotationId': { '$in': annotationStringIds }
        }
        self.removeWithQuery(query)

    def initialize(self):
        self.name = "annotation_property_values"
        events.bind('model.upenn_annotation.removeStringIds', 'upenn.annotation_values.annotationsRemovedEvent', self.annotationsRemovedEvent)

    def validate(self, document):
        try:
            self.validator.validate(document)
        except jsonschema.ValidationError as exp:
            raise ValidationException(exp)

        # find existing property values for the annotation id
        annotationId = document['annotationId']
        query = {'annotationId': annotationId}
        existingProperties = self.findOne(query)

        # keep existing values
        if existingProperties:
            existingValues = existingProperties['values']
            existingValues.update(document['values'])
            document['values'] = existingValues
            self.remove(existingProperties)

        # TODO(performance): create sparse index on properties if nonexisting https://docs.mongodb.com/manual/reference/operator/query/exists/

        return document

    def appendValues(self, creator, values, annotationId, datasetId):
        self.save({'annotationId': annotationId,
                  'values': values, 'datasetId': datasetId})

    def delete(self, propertyId, datasetId):
        # Could use self.collection.updateMany but girder doesn't expose this method
        for document in self.find({'datasetId': datasetId}):
            document['values'].pop(propertyId, None)
            if len(document['values']) == 0:
                self.remove(document)
            else:
                self.save(document, False)

    def histogram(self, propertyId, datasetId, buckets=255):
        valueKey = 'values.' + propertyId
        match = {
            '$match': {
                'datasetId': datasetId,
                # TODO(performance): sparse index see above
                valueKey: {'$exists': True, '$ne': None},
            }
        }

        bucket = {
            '$bucketAuto': {
                'groupBy': '$' + valueKey,
                'buckets': buckets
            }
        }

        project = {
            '$project': {
                '_id': False,
                'min': '$_id.min',
                'max': '$_id.max',
                'count': True
            }
        }

        return self.collection.aggregate([
            match,
            bucket,
            project
        ])

    # def SSE for property change, sends the whole annotation
