<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
// 
// Setup Vue
// 
import Vue from 'vue'
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

// make http requests work
import axios from 'axios'
Vue.http = Vue.prototype.$http = axios

// in renderer process
import { webFrame } from 'electron'
webFrame.setVisualZoomLevelLimits(1, 3)

// Routes
import Router from "vue-router"
import routes from './routes'
Vue.use(Router)

import store from './store'

// 
// Libraries
// 

// Bootstrap
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
Vue.use(BootstrapVue)

// GoodVue
import GoodVue from 'good-vue'
Vue.use(GoodVue)

// Baseline
// import 'css-baseline/css/4.css'

// KeenUI
import KeenUI from 'keen-ui'
import 'keen-ui/dist/keen-ui.css'
Vue.use(KeenUI)

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

import Toasted from 'vue-toasted'
Vue.use(Toasted)

// 
// App
// 
let App = {
    components: { App, VueJsonPretty },
    name: 'video_labeller',
    router: new Router({routes: routes}),
}
// create and attach app
setTimeout(()=>(new (Vue.extend(App))).$mount('#app'),500)
export default App
</script>

<style>
::selection {
    background:rgba(255, 255, 125, 0.99);
    color:#032764;
}
</style>
