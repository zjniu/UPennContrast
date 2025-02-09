<template>
  <v-expansion-panels>
    <v-expansion-panel v-model="show" v-if="tool">
      <v-expansion-panel-header>
        {{ tool.name }} worker menu
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-container>
          <v-row>
            <v-col>
              <v-subheader>Image: {{ tool.values.image.image }}</v-subheader>
            </v-col>
          </v-row>
          <v-row>
            <worker-interface-values
              :workerInterface="workerInterface"
              v-model="interfaceValues"
            />
          </v-row>
          <v-row>
            <v-btn @click="preview">preview</v-btn>
            <v-spacer></v-spacer>
            <v-btn @click="compute" :disabled="running"
              ><v-progress-circular
                size="16"
                v-if="running"
                indeterminate
              ></v-progress-circular>
              <v-icon v-if="previousRunStatus === false">mdi-close</v-icon>
              <v-icon v-if="previousRunStatus === true">mdi-check</v-icon>
              <span>Compute</span></v-btn
            >
          </v-row>
          <v-row>
            <v-checkbox
              v-model="displayWorkerPreview"
              label="Display Previews"
            ></v-checkbox>
          </v-row>
        </v-container>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";
import store from "@/store";
import annotationsStore from "@/store/annotation";
import { IToolConfiguration, IWorkerInterfaceValues } from "@/store/model";
import TagFilterEditor from "@/components/AnnotationBrowser/TagFilterEditor.vue";
import LayerSelect from "@/components/LayerSelect.vue";
import propertiesStore from "@/store/properties";
import WorkerInterfaceValues from "@/components/WorkerInterfaceValues.vue";
// Popup for new tool configuration
@Component({
  components: {
    LayerSelect,
    TagFilterEditor,
    WorkerInterfaceValues
  }
})
export default class annotationWorkerMenu extends Vue {
  readonly store = store;
  readonly annotationsStore = annotationsStore;
  readonly propertyStore = propertiesStore;

  show: boolean = true;
  running: boolean = false;
  previousRunStatus: boolean | null = null;

  interfaceValues: IWorkerInterfaceValues = {};

  @Prop()
  readonly tool!: IToolConfiguration;

  get workerInterface() {
    return this.propertyStore.getWorkerInterface(this.image) || {};
  }

  get image() {
    return this.tool?.values?.image?.image;
  }

  get workerPreview() {
    return (
      this.propertyStore.getWorkerPreview(this.image) || {
        text: "null",
        image: ""
      }
    );
  }

  get displayWorkerPreview() {
    return this.propertyStore.displayWorkerPreview;
  }

  set displayWorkerPreview(value: boolean) {
    this.propertyStore.setDisplayWorkerPreview(value);
  }

  compute() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.previousRunStatus = null;
    this.annotationsStore.computeAnnotationsWithWorker({
      tool: this.tool,
      workerInterface: this.interfaceValues,
      callback: success => {
        this.running = false;
        this.previousRunStatus = success;
      }
    });
    this.show = false;
  }

  preview() {
    this.propertyStore.requestWorkerPreview({
      image: this.image,
      tool: this.tool,
      workerInterface: this.interfaceValues
    });
  }

  mounted() {
    this.updateInterface();
  }

  @Watch("tool")
  updateInterface() {
    if (Object.keys(this.workerInterface).length === 0) {
      this.propertyStore.fetchWorkerInterface(this.image);
    }
  }
}
</script>
