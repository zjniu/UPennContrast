<template>
  <v-card>
    <v-card-title>
      Annotation Properties
    </v-card-title>
    <v-card-text>
      <v-btn
        outlined
        class="ma-2"
        @click="computeUncomputedProperties"
        :disabled="uncomputedRunning > 0 || uncomputedProperties.length <= 0"
      >
        {{
          uncomputedRunning > 0 ? "Computing uncomputed" : "Compute uncomputed"
        }}
        <template v-if="uncomputedRunning > 0">
          <v-progress-circular indeterminate />
        </template>
        <template v-else>
          <v-icon right color="primary">
            mdi-play
          </v-icon>
        </template>
      </v-btn>
      <v-container class="pa-0">
        <v-expansion-panels>
          <!-- Header for property -->
          <v-expansion-panel readonly v-if="properties.length > 0">
            <v-expansion-panel-header>
              <annotation-property-header />
              <template v-slot:actions>
                <v-icon color="transparent">$expand</v-icon>
              </template>
            </v-expansion-panel-header>
          </v-expansion-panel>
          <!-- List of all the properties -->
          <v-expansion-panel
            v-for="(property, index) in properties"
            :key="`${property.id} ${index}`"
          >
            <v-expansion-panel-header>
              <annotation-property :property="property" />
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <annotation-property-body :property="property" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import store from "@/store";
import propertyStore from "@/store/properties";
import filterStore from "@/store/filters";

import TagFilterEditor from "@/components/AnnotationBrowser/TagFilterEditor.vue";
import AnnotationProperty from "@/components/AnnotationBrowser/AnnotationProperties/Property.vue";
import AnnotationPropertyHeader from "@/components/AnnotationBrowser/AnnotationProperties/PropertyHeader.vue";
import AnnotationPropertyBody from "@/components/AnnotationBrowser/AnnotationProperties/PropertyBody.vue";

@Component({
  components: {
    TagFilterEditor,
    AnnotationProperty,
    AnnotationPropertyHeader,
    AnnotationPropertyBody
  }
})
export default class PropertyList extends Vue {
  readonly store = store;
  readonly propertyStore = propertyStore;
  readonly filterStore = filterStore;

  uncomputedRunning: number = 0;

  get properties() {
    return propertyStore.properties;
  }

  get uncomputedProperties() {
    const res = [];
    for (const property of this.propertyStore.properties) {
      if (
        this.propertyStore.uncomputedAnnotationsPerProperty[property.id]
          .length > 0
      ) {
        res.push(property);
      }
    }
    return res;
  }

  computeUncomputedProperties() {
    for (const property of this.uncomputedProperties) {
      ++this.uncomputedRunning;
      this.propertyStore.computeProperty({
        property,
        callback: () => {
          --this.uncomputedRunning;
        }
      });
    }
  }
}
</script>
