<template>
    <apexchart ref="chart" class='shift-down' type=area width='100%' :height='height' :options="chartOptions" :series="series" />
</template>

<script>
import { videoComponent } from '@/components/video-component'
import { labelManager } from '../components/label-manager'
import { settingsPanel } from './settings-panel.vue'

export let graphComponent
export default {
    props: [ 'height' ],
    beforeCreate() {
        graphComponent = this
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
        // 
        // update bounds
        // 
        
        // when the user seeks a video
        videoComponent.$on("seek", (eventData) => {
            this.updateBounds()
        })
        
        // when the range changes
        settingsPanel.$watch('settings.graphRange',  (newValue) => {
            if (settingsPanel.settings.graphRange > 0) {
                this.updateBounds()
            }
        })
        
        // 
        // update data
        // 
        
        // when graph says to update
        labelManager.$on("say:graphShouldUpdate", (eventData) => {
            this.updateData()
        })
        
        // when user toggles showGraph
        settingsPanel.$watch('settings.showGraph', (newValue) => {
            if (settingsPanel.settings.showGraph) {
                this.updateData()
            }
        })
        
        // when label toggle is changed or added (deep change of labelToggles)
        labelManager.$watch('labelToggles', {
            deep: true,
            handler: (val)=>{
                this.updateData()
            }   
        })
        
        // 
        // request update
        // 
        
        // update the graph when video is playing
        setInterval(()=>{
            if (!videoComponent.paused) {
                this.$emit("say:graphUpdateRequest")
            }
        }, 1000/this.graphFrameRate)
    },
    methods: {
        updateBounds() {
            let currentTime  = videoComponent.currentTime-0
            this.chartOptions.xaxis.min = currentTime - settingsPanel.settings.graphRange/2
            this.chartOptions.xaxis.max = currentTime + settingsPanel.settings.graphRange/2
            
            // force a refresh
            this.chartOptions = {...this.chartOptions}
            
        },
        updateData() {
            // remove all the labels that have a false toggle
            this.series = labelManager.labels.filter(each => labelManager.labelToggles[each.name])
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