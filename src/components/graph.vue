<template>
    <apexchart class='shift-down' type=area width='100%' :height='height' :options="chartOptions" :series="series" />
</template>

<script>
import LabelRecord from '../util/LabelRecord'
import {statelessData} from "../pages/Home"

export default {
    props: ['getData', 'height' ],
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
                style: {
                    colors: ['#89DDFF'],
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
    computed: {
    },
    watch: {
        getData(newValue, prevValue) {
            // convert min and max into numbers
            this.chartOptions.xaxis.min = statelessData.graphMin-0
            this.chartOptions.xaxis.max = statelessData.graphMax-0
            if (newValue instanceof Function) {
                let data = newValue()
                let series = []
                if (data instanceof Object) {
                    for (let each in data) {
                        series.push({
                            name: each,
                            data: data[each]
                        })
                    }
                }
                this.series = series
            }
        },
    },
    methods: {
    },
    mounted() {
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
</style>