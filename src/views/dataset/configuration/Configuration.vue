<template>
  <router-view></router-view>
</template>
<script lang="ts">
import store from "@/store";
import routeMapper from "@/utils/routeMapper";

export default routeMapper(
  {
    config: {
      parse: String,
      get: () => store.selectedConfigurationId,
      set: (value: string) => store.setSelectedConfiguration(value)
    }
  },
  {
    xy: {
      parse: v => parseInt(v, 10),
      get: () => store.xy,
      set: (value: number) => store.setXY(value || 0)
    },
    unrollXY: {
      parse: v => v === "true",
      get: () => store.unrollXY,
      set: (value: boolean) => store.setUnrollXY(value)
    },
    z: {
      parse: v => parseInt(v, 10),
      get: () => store.z,
      set: (value: number) => store.setZ(value || 0)
    },
    unrollZ: {
      parse: v => v === "true",
      get: () => store.unrollZ,
      set: (value: boolean) => store.setUnrollZ(value)
    },
    time: {
      parse: v => parseInt(v, 10),
      get: () => store.time,
      set: (value: number) => store.setTime(value || 0)
    },
    unrollT: {
      parse: v => v === "true",
      get: () => store.unrollT,
      set: (value: boolean) => store.setUnrollT(value)
    },
    layer: {
      parse: v => v,
      get: () => store.layerMode,
      set: (value: string) =>
        store.setLayerMode(
          ["single", "multiple", "unroll"].indexOf(value) >= 0
            ? value
            : "multiple"
        )
    },
    snapshot: {
      parse: v => v,
      get: () => store.snapshot,
      set: (value: string) => store.setSnapshot(value)
    }
  }
);
</script>
