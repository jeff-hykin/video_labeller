import Vue from 'vue'

// Charts
import VueApexCharts from 'vue-apexcharts'
Vue.use(VueApexCharts)
Vue.component('apexchart', VueApexCharts)
import moment from 'moment'
window.moment = moment