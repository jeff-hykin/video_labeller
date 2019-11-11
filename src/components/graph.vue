<template>
    <graph-line
            class='my-graph'
            :width="600"
            :height="400"
            :shape="'normal'"
            :axis-min="0"
            :axis-max="50"
            :axis-full-mode="true"
            :labels="labels"
            :names="names"
            :values="values">
        <note :text="'Line Chart'"></note>
        <legends :names="names"></legends>
        <tooltip :names="names" :position="'right'"></tooltip>
        <guideline :tooltip-y="true"></guideline>
    </graph-line>
</template>

<script>

let scale0to100 = (aList) => {
    let minScore = Math.min(...aList)
    let shiftedScores = aList.map(each => each - minScore)
    let maxScore = Math.max(...shiftedScores)
    let scaleTo100 = 100.0 / maxScore
    let adjustedScores = shiftedScores.map(each => each * scaleTo100)
    return adjustedScores
}
    
export default {
    props: ['jsonData'],
    data: ()=>({
        scores: {
        },
        names: []
    }),
    computed: {
        values() {
            try {
                return Object.values(this.$data.scores)
            } catch (e) {}
            return []
        },
        labels() {
            let output = []
            try {
                output = Object.keys(this.$data.scores)
            } catch (e) {}
            return output
        },
        names() {
            let labels = []
            try {
                labels = Object.keys(this.$props.jsonData)
            } catch (e) {}
            return labels
        }
    },
    watch: {
        jsonData() {
            this.updateValues()
        }
    },
    methods: {
        updateValues() {
            this.names = Object.keys(this.$data.scores)
        }
    },
    mounted() {
        this.updateValues()
    },
}
</script>

<style scoped>
/deep/.widget-legend {
    padding: 2rem;
}
/deep/ .widget-legend {
    padding: 2rem;
}
</style>