<template>
    <apexchart class='shift-down' type=area width='100%' :height='height' :options="chartOptions" :series="series" />
</template>

<script>
import LabelRecord from '../util/LabelRecord'
import { videoComponent } from '@/components/video-component'
import { featureManager } from '../components/feature-manager'
import { settingsPanel } from './settings-panel.vue'

export let graph
export default {
    props: [ 'height' ],
    beforeCreate() {
        graph = this
    },
    data: ()=>({
        data: {},
        graphFrameRate: 30, // fps
        series: [],
        
        chartOptions: {
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: "straight",
            },
            colors: ['#2E93fA', '#546E7A', '#FF9800', '#C792EA', '#E91E63', '#89DDFF', ],
            title: {
                text: "",
                align: "left",
                style: {
                    fontSize: "14px",
                },
            },
            xaxis: {
                min: 0,
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: true,
                },
                tickAmount: 4,
                labels: {
                    formatter: each => each.toFixed(2),
                }
            },
            yaxis: {
                min: 0,
                max: 1,
                tickAmount: 4,
                floating: false,
                labels: {
                    style: {
                        color: "#fff",
                    },
                    offsetY: -7,
                    offsetX: 0,
                    formatter: each => `${Math.floor(each * 100)}%`
                },
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
            },
            fill: {
                opacity: 0.5,
            },
            tooltip: {
                fixed: {
                    enabled: false,
                    position: "topRight",
                },
            },
            zoom: {
                enabled: true,
                type: 'x',
            },
            legend: {
                position: 'top',
            },
            grid: {
                yaxis: {
                    lines: {
                        offsetX: -30,
                    },
                },
                padding: {
                    left: 20,
                },
            },
        },
    }),
    mounted() {
        // set the rate for the graph to be updated
        setInterval(()=>graph.update({force: false}), 1000/this.graphFrameRate)
    },
    computed: {
    },
    watch: {
        data(newValue) {            
            // convert min and max into numbers
            let series = []
            if (this.data instanceof Object) {
                for (let each in this.data) {
                    // if the label for it is turned on
                    if (featureManager.labels[each] != false) {
                        series.push({
                            name: each,
                            data: this.data[each]
                        })
                    }
                }
            }
            this.series = series
        },
    },
    methods: {
        update({force=true, noDataChange=false}) {
            let dataWasChanged = !noDataChange
            if (videoComponent.exists && featureManager.videoLabelData && (force || !videoComponent.paused)) {
                let currentTime  = videoComponent.currentTime
                // update the graph if needed
                if (dataWasChanged) {
                    this.data = {...featureManager.allRecords}
                }
                // extract the time segment from the labels
                this.chartOptions.xaxis.min = currentTime - settingsPanel.settings.graphRange/2
                this.chartOptions.xaxis.max = currentTime + settingsPanel.settings.graphRange/2
            }
        }
    },
}
</script>

<style scoped>
.wrapper {
    position: fixed;
    bottom: 6rem;
    height: fit-content;
    width: 100vw;
    left: 6rem;
    overflow: auto;
}
.shift-down {
    margin-bottom: -20px;
    margin-top: 12px;
}
>>> .apexcharts-xaxis text {
    fill: rgba(0, 0, 0, 0.3) !important;
}
</style>