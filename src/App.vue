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
Vue.config.devtools = process.env.NODE_ENV === 'development'

// make http requests work
import axios from 'axios'
Vue.http = Vue.prototype.$http = axios

// in renderer process
import { webFrame } from 'electron'
// allow zooming in with Mac Trackpad
webFrame.setVisualZoomLevelLimits(1, 3)

// Routes
import Router from "vue-router"
import routes from './routes'
Vue.use(Router)

// 
// Libraries
// 

// GoodVue
import GoodVue from 'good-vue'
Vue.use(GoodVue)

// Baseline
import 'css-baseline/css/3.css'

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
    name: 'video_labeller',
    components: { App, VueJsonPretty },
    router: new Router({routes: routes}),
}
// create and attach app
setTimeout(()=>(new (Vue.extend(App))).$mount('#app'),0)
export default App
</script>

<style>
:root {
    --blue: #007bff;
    --indigo: #6610f2;
    --purple: #6f42c1;
    --pink: #e83e8c;
    --red: #dc3545;
    --orange: #fd7e14;
    --yellow: #ffc107;
    --green: #28a745;
    --teal: #20c997;
    --cyan: #17a2b8;
    --white: #fff;
    --gray: #6c757d;
    --gray-dark: #343a40;
    --primary: #007bff;
    --secondary: #6c757d;
    --success: #28a745;
    --info: #17a2b8;
    --warning: #ffc107;
    --danger: #dc3545;
    --light: #f8f9fa;
    --dark: #343a40;
}
</style>
