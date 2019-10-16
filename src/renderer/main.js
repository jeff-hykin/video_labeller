import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

// Bootstrap
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
Vue.use(BootstrapVue)

// GoodVue
import GoodVue from 'good-vue'
Vue.use(GoodVue)

// KeenUI
import KeenUI from 'keen-ui'
import 'keen-ui/dist/keen-ui.css'
Vue.use(KeenUI)

// Baseline
import 'css-baseline/css/4.css'

// VueJsonPretty
import VueJsonPretty from 'vue-json-pretty'

// VueGraph
import VueGraph from 'vue-graph'
import GraphLine3D from 'vue-graph/src/components/line3d.js'
import NoteWidget from 'vue-graph/src/widgets/note.js'
import LegendWidget from 'vue-graph/src/widgets/legends.js'

Vue.component(GraphLine3D.name, GraphLine3D)
Vue.component(NoteWidget.name, NoteWidget)
Vue.component(LegendWidget.name, LegendWidget)
Vue.use(VueGraph)



// in renderer process
import { webFrame } from 'electron'
webFrame.setVisualZoomLevelLimits(1, 3)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App, VueJsonPretty },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
