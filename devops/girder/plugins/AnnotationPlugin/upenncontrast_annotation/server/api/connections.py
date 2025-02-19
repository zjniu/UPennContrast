from girder.api import access
from girder.api.describe import Description, autoDescribeRoute, describeRoute
from girder.constants import AccessType
from girder.api.rest import Resource, loadmodel
from ..models.connections import AnnotationConnection as ConnectionModel
from girder.exceptions import AccessException, RestException, ValidationException


class AnnotationConnection(Resource):

    def __init__(self):
        super().__init__()
        self.resourceName = 'annotation_connection'

        self._connectionModel = ConnectionModel()

        self.route('DELETE', (':id',), self.delete)
        self.route('GET', (':id',), self.get)
        self.route('GET', (), self.find)
        self.route('POST', (), self.create)
        self.route('PUT', (':id',), self.update)
        self.route('POST',('connectTo',) , self.connectToNearest)
        self.route('POST', ('multiple',), self.multipleCreate)

    # TODO: anytime a dataset is mentioned, load the dataset and check for existence and that the user has access to it
    # TODO: load both childe and parent annotations, and check that they share existence, access and location
    # TODO: creation date, update date, creatorId
    # TODO: error handling and documentation

    @access.user
    @describeRoute(Description("Create a new connection").param('body', 'Connection Object', paramType='body'))
    def create(self, params):
        currentUser = self.getCurrentUser()
        if not currentUser:
            raise AccessException('User not found', 'currentUser')
        return self._connectionModel.create(currentUser, self.getBodyJson())

    @access.user
    @describeRoute(Description("Create multiple new connections").param('body', 'Connection Object List', paramType='body'))
    def multipleCreate(self, params):
        currentUser = self.getCurrentUser()
        if not currentUser:
            raise AccessException('User not found', 'currentUser')
        return [self._connectionModel.create(currentUser, connection) for connection in self.getBodyJson()]

    @describeRoute(Description("Delete an existing connection").param('id', 'The connection\'s Id', paramType='path').errorResponse('ID was invalid.')
                   .errorResponse('Write access was denied for the connection.', 403))
    @access.user
    @loadmodel(model='annotation_connection', plugin='upenncontrast_annotation', level=AccessType.WRITE)
    def delete(self, annotation_connection, params):
        self._connectionModel.remove(annotation_connection)

    @describeRoute(Description("Update an existing connection")
                   .param('id', 'The ID of the connection.', paramType='path')
                   .param('body', 'A JSON object containing the connection.',
                          paramType='body')
                   .errorResponse('Write access was denied for the item.', 403)
                   .errorResponse('Invalid JSON passed in request body.')
                   .errorResponse("Validation Error: JSON doesn't follow schema."))
    @access.user
    @loadmodel(model='annotation_connection', plugin='upenncontrast_annotation', level=AccessType.WRITE)
    def update(self, connection, params):
        connection.update(self.getBodyJson())
        self._connectionModel.update(connection)

    @access.user
    @autoDescribeRoute(Description("Search for connections")
                       .responseClass('annotation_connection')
                       .param('datasetId', 'Get all connections in this dataset', required=False)
                       .param('parentId', 'Get all connections from this annotation', required=False)
                       .param('childId', 'Get all connections to this annotation', required=False)
                       .param('nodeAnnotationId', 'Get all connections to or from this annotation', required=False)
                       .pagingParams(defaultSort='_id')
                       .errorResponse()
                       )
    def find(self, params):
        limit, offset, sort = self.getPagingParameters(params, 'lowerName')
        query = {}
        if 'datasetId' in params and params['datasetId']:
          query['datasetId'] = params['datasetId']
        if 'childId' in params and params['childId']:
            query['childId'] = params['childId']
        if 'parentId' in params and params['parentId']:
            query['parentId'] = params['parentId']
        if 'nodeAnnotationId' in params and params['nodeAnnotationId']:
            query['$or'] = [
                {
                    'parentId': params['nodeAnnotationId']
                },
                {
                    'childId': params['nodeAnnotationId']
                }
            ]
        return self._connectionModel.findWithPermissions(query, sort=sort, user=self.getCurrentUser(), level=AccessType.READ, limit=limit, offset=offset)

    @access.user
    @autoDescribeRoute(Description("Get an connection by its id.")
                       .param('id', 'The connection\'s id', paramType='path'))
    @loadmodel(model='annotation_connection', plugin='upenncontrast_annotation', level=AccessType.READ)
    def get(self, annotation_connection):
        return annotation_connection


    @access.user
    @describeRoute(Description("Create connections between annotations").param('body', 'Connection Object', paramType='body'))
    def connectToNearest(self, params):
        currentUser = self.getCurrentUser()
        if not currentUser:
            raise AccessException('User not found', 'currentUser')
        return self._connectionModel.connectToNearest(user=currentUser, info=self.getBodyJson())
