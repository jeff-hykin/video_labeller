<template>
    <apexchart type=area width='100%' height='250' :options="chartOptions" :series="series" />
</template>

<script>
import { duration } from 'moment'
import LabelRecord from '../util/LabelRecord'
    
export default {
    props: ['getData'],
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
        getData(newValue, prevValue) {
            console.log(`newValue is:`,newValue)
            if (newValue instanceof Function) {
                let {max, min, data} = newValue()
                console.log(`data is:`,data)
                console.log(`max is:`,max)
                console.log(`min is:`,min)
                this.chartOptions.xaxis.min = min
                this.chartOptions.xaxis.max = max
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
</style>