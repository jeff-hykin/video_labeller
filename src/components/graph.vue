<template>
    <apexchart ref="chart" class='shift-down' type=area width='100%' :height='height' :options="chartOptions" :series="series" />
</template>

<script>
import { videoComponent } from '@/components/videoWrapper'
import { labelManager } from '@/components/labelManager'
import { settingsPanelComponent } from '@/components/settingsPanel'

export let graphComponent
export default {
    props: [ 'height' ],
    beforeCreate() {
        graphComponent = this
        window.graphComponent = graphComponent
    },
    data: ()=>({
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
        settingsPanelComponent.$watch('settings.graphRange',  (newValue) => {
            if (settingsPanelComponent.settings.graphRange > 0) {
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
        settingsPanelComponent.$watch('settings.showGraph', (newValue) => {
            if (settingsPanelComponent.settings.showGraph) {
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
        
        // when the video ends (this is an edgecase)
        videoComponent.$on("ended", ()=>{
            this.updateData()
        })
        
        // 
        // request update
        // 
        
        // update the graph when video is playing
        setInterval(()=>{
            if (!videoComponent.paused) {
                this.$emit("say:graphUpdateRequest")
            }
        }, 1000/settingsPanelComponent.settings.graphFrameRate)
    },
    methods: {
        updateBounds() {
            let currentTime  = videoComponent.currentTime-0
            let chart = graphComponent.$refs.chart.chart
            let config = chart.zoomPanSelection.w.config
            let ctx = chart.zoomPanSelection.ctx
            let options = {
                xaxis: {
                    min: this.chartOptions.xaxis.min = currentTime - settingsPanelComponent.settings.graphRange/2,
                    max: this.chartOptions.xaxis.max = currentTime + settingsPanelComponent.settings.graphRange/2,
                },
            }
            ctx._updateOptions(options, false, false)
        },
        updateData() {
            // remove all the labels that have a false toggle
            this.series = labelManager.labels.map(each => {
                if (each.data instanceof Array) {
                    if (labelManager.labelToggles[each.name]) {
                        return each
                    // if the toggle is disabled, then don't show the data
                    } else {
                        return {
                            ...each,
                            data: []
                        }
                    }
                }
            })
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