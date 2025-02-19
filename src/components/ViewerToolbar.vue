<template>
  <div>
    <div v-mousetrap="mousetrapSliders">
      <toolset></toolset>
      <v-layout>
        <value-slider
          v-model="xy"
          label="XY"
          :min="0"
          :max="maxXY"
          :title="maxXY > 0 ? maxXY + 1 + ' XY Values (hotkeys w/r)' : ''"
          :offset="1"
        />
        <v-checkbox
          class="ml-3"
          v-model="unrollXY"
          label="Unroll"
          :disabled="!(maxXY > 0 || unrollXY)"
        />
      </v-layout>
      <v-layout>
        <value-slider
          v-model="z"
          label="Z"
          :min="0"
          :max="maxZ"
          :title="maxZ > 0 ? maxZ + 1 + ' Z Values (hotkeys d/e)' : ''"
          :offset="1"
        />
        <v-checkbox
          class="ml-3"
          v-model="unrollZ"
          label="Unroll"
          :disabled="!(maxZ > 0 || unrollZ)"
        />
      </v-layout>
      <v-layout>
        <value-slider
          v-model="time"
          label="Time"
          :min="0"
          :max="maxTime"
          :title="maxTime > 0 ? maxTime + 1 + ' Time Values (hotkeys s/f)' : ''"
          :offset="1"
        />
        <v-checkbox
          class="ml-3"
          v-model="unrollT"
          label="Unroll"
          :disabled="!(maxTime > 0 || unrollT)"
        />
      </v-layout>
      <v-radio-group
        v-model="layerMode"
        label="Layers: "
        mandatory
        dense
        row
        hide-details
        class="layer-mode-controls"
      >
        <v-radio value="single" label="Single" class="smaller" />
        <v-radio value="multiple" label="Multiple" class="smaller" />
        <v-radio value="unroll" label="Unroll" class="smaller" />
      </v-radio-group>
    </div>
    <div class="lowertools">
      <slot></slot>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.v-input--selection-controls {
  margin-top: 0;
}
.lowertools {
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
}
.layer-mode-controls {
  ::v-deep .v-radio {
    margin-right: 10px;
    > .v-input--selection-controls__input {
      margin-right: 0;
    }
  }
}
</style>
<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import ValueSlider from "./ValueSlider.vue";
import SwitchToggle from "./SwitchToggle.vue";
import Toolset from "@/tools/toolsets/Toolset.vue";
import store from "@/store";

@Component({
  components: {
    ValueSlider,
    SwitchToggle,
    Toolset
  }
})
export default class ViewerToolbar extends Vue {
  readonly store = store;

  private changeQuery(param: string, value: string) {
    const old = this.$route.query[param];
    if (old === value) {
      return;
    }
    this.$router.replace({
      query: {
        ...this.$route.query,
        [param]: value
      }
    });
  }

  get xy() {
    return this.store.xy;
  }

  get z() {
    return this.store.z;
  }

  get time() {
    return this.store.time;
  }

  set xy(value: number) {
    if (value !== this.xy) {
      this.changeQuery("xy", value.toString());
    }
  }

  set z(value: number) {
    if (value !== this.z) {
      this.changeQuery("z", value.toString());
    }
  }

  set time(value: number) {
    if (value !== this.time) {
      this.changeQuery("time", value.toString());
    }
  }

  get unrollXY() {
    return this.store.unrollXY;
  }

  set unrollXY(value: boolean) {
    if (value !== this.unrollXY) {
      this.changeQuery("unrollXY", value.toString());
    }
  }

  @Watch("unrollXY")
  watchUnrollXY(_value: boolean) {
    this.store.refreshDataset();
  }

  get unrollZ() {
    return this.store.unrollZ;
  }

  set unrollZ(value: boolean) {
    if (value !== this.unrollZ) {
      this.changeQuery("unrollZ", value.toString());
    }
  }

  @Watch("unrollZ")
  watchUnrollZ(_value: boolean) {
    this.store.refreshDataset();
  }

  get unrollT() {
    return this.store.unrollT;
  }

  set unrollT(value: boolean) {
    if (value !== this.unrollT) {
      this.changeQuery("unrollT", value.toString());
    }
  }

  @Watch("unrollT")
  watchUnrollT(_value: boolean) {
    this.store.refreshDataset();
  }

  get maxXY() {
    return this.store.dataset ? this.store.dataset.xy.length - 1 : this.xy;
  }

  get maxZ() {
    return this.store.dataset ? this.store.dataset.z.length - 1 : this.z;
  }

  get maxTime() {
    return this.store.dataset ? this.store.dataset.time.length - 1 : this.time;
  }

  set layerMode(value: "multiple" | "single" | "unroll") {
    if (value !== this.layerMode) {
      this.changeQuery("layer", value);
    }
  }

  get layerMode() {
    return this.store.layerMode;
  }

  // Mousetrap bindings
  mousetrapSliders = [
    {
      // XY left
      bind: "w",
      handler: () => {
        this.xy = Math.max(this.xy - 1, 0);
      }
    },
    {
      // XY right
      bind: "r",
      handler: () => {
        this.xy = Math.min(this.xy + 1, this.maxXY);
      }
    },
    {
      // Z down
      bind: "d",
      handler: () => {
        this.z = Math.max(this.z - 1, 0);
      }
    },
    {
      // Z up
      bind: "e",
      handler: () => {
        this.z = Math.min(this.z + 1, this.maxZ);
      }
    },
    {
      // previous T
      bind: "s",
      handler: () => {
        this.time = Math.max(this.time - 1, 0);
      }
    },
    {
      // next T
      bind: "f",
      handler: () => {
        this.time = Math.min(this.time + 1, this.maxTime);
      }
    }
  ];
}
</script>
