<template>
    <apexchart ref="chart" class='shift-down' type=area width='100%' :height='height' :options="chartOptions" :series="series" />
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
        // update the graph whenever the video is being scubbed
        videoComponent.$on("seek", (eventObj)=> {
            // update the bounds when seeking
            this.updateBounds()
        })
        // update whenever the graphRange changes 
        settingsPanel.$watch('settings.graphRange',  (newValue) => {
            if (settingsPanel.settings.graphRange > 0) {
                this.updateBounds()
            }
        })
        // update whenever the graph gets toggled 
        settingsPanel.$watch('settings.showGraph', (newValue) => {
            if (settingsPanel.settings.showGraph) {
                this.updateData()
            }
        })
        // update whenever the videoLabelData shallow changes
        featureManager.$watch('videoLabelData', (newValue) => {
            // actually update the data
            this.updateData()
        })
        // update whenever the labels deeply change
        featureManager.$watch('labels', {
            deep: true,
            handler: (val)=>{
                this.updateData()
            }   
        })
        // update the graph when video is playing
        setInterval(()=>{
            if (!videoComponent.paused) {
                // actually update the data
                this.updateData()
            }
        }, 1000/this.graphFrameRate)
    },
    computed: {
    },
    methods: {
        updateBounds() {
            let currentTime  = videoComponent.currentTime-0
            this.chartOptions.xaxis.min = currentTime - settingsPanel.settings.graphRange/2;
            this.chartOptions.xaxis.max = currentTime + settingsPanel.settings.graphRange/2;
            
            // force a refresh
            this.chartOptions = {...this.chartOptions}
            
        },
        updateData() {
            let data = featureManager.allRecords()
            let series = []
            for (let each in data) {
                // if the label for it is turned on
                if (featureManager.labels[each] != false) {
                    series.push({
                        name: each,
                        data: data[each]
                    })
                }
            }
            this.series = series
            // this.series = series
            this.updateBounds()
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