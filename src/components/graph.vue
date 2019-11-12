<template>
    <apexchart type=area width='100%' height='250' :options="chartOptions" :series="series" />
</template>

<script>
import { duration } from 'moment'

let scale0to100 = (aList) => {
    let minScore = Math.min(...aList)
    let shiftedScores = aList.map(each => each - minScore)
    let maxScore = Math.max(...shiftedScores)
    let scaleTo100 = 100.0 / maxScore
    let adjustedScores = shiftedScores.map(each => each * scaleTo100)
    return adjustedScores
}
    
export default {
    props: ['jsonData', 'duration'],
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
    computed: {
    },
    watch: {
        jsonData(newValue, prevValue) {
            // only update if something actually changed
            if (JSON.stringify(newValue) != JSON.stringify(prevValue)) {
                this.updateData(newValue)
            }
        },
    },
    methods: {
        updateData(newValue) {
            let output = []
            if (newValue) {
                for (let eachKey in newValue) {
                    output.push({
                        name: eachKey,
                        data: newValue[eachKey],
                    })
                }
            }
            this.chartOptions.xaxis.max = this.$props.duration
            this.series = output
        }
    },
    mounted() {
        this.updateData(this.$props.jsonData)
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
</style>