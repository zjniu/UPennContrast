import Vue from "vue";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@mdi/font/css/materialdesignicons.min.css";

import "reflect-metadata";
import "./registerServiceWorker";
import vuetify from "./plugins/vuetify";
import VueAsyncComputed from "vue-async-computed";
import "./plugins/router";
import "./plugins/resize";
import { RestClientInstance } from "./girder";

import main, { store, Main } from "./store";

import routes from "./views";
import App from "./App.vue";

import "./style.scss";
import VueRouter from "vue-router";

// Mousetrap is configured for further imports (no need to import record plugin again)
import _Mousetrap from "mousetrap";
import "mousetrap/plugins/record/mousetrap-record.min.js";
import vMousetrap from "./utils/v-mousetrap";

Vue.config.productionTip = false;

Vue.use(VueAsyncComputed);
Vue.use(vMousetrap);

main.initialize();

new Vue({
  provide: {
    // use a proxy to dynamically resolve to the right girderRest client
    girderRest: new Proxy(main, {
      get(obj: Main, prop: keyof RestClientInstance) {
        return obj.girderRest[prop];
      }
    })
  },
  router: new VueRouter({
    routes
  }),
  store,
  vuetify,
  render: (h: any) => h(App)
}).$mount("#app");
