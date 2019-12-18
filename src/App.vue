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


// 
// Plugins
// 
import './plugins/css-baseline'
import './plugins/good-vue'
import './plugins/keen-ui'
import './plugins/vue-apexcharts'
import './plugins/vue-toasted'
import './plugins/self-listener'
import './plugins/window-listener'
import './plugins/simple-functional-components'
import { Router } from './plugins/vue-router'

// routes
import routes from './routes'

// 
// App
// 
let App = {
    name: 'video_labeler',
    components: { App },
    router: new Router({ routes }),
}
// create and attach app
setTimeout(()=>(new (Vue.extend(App))).$mount('#app'),0)
export default App
</script>

<style lang='scss'>
:root {
    --blue: #007bff;
    --indigo: #6610f2;
    --purple: #6f42c1;
    --pink: #e83e8c;
    --red: #dc3545;
    --orange: #fd7e14;
    --yellow: #ffc107;
    --green: #28a745; // somewhere this is being overriden
    --teal: #20c997;
    --cyan: #64ffda;
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

/* fallback */
@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2) format('woff2');
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

</style>
