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
        eyebrowScores: [],
        raised: [],
        mouthOpenness: []
    }),
    computed: {
        names() {
            try {
                return Object.keys(this.$data)
            } catch (e) {}
            return []
        },
        values() {
            try {
                return Object.values(this.$data)
            } catch (e) {}
            return []
        },
        labels() {
            let labels = []
            try {
                for (let each in this.$props.jsonData) {
                    labels.push(each)
                }
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
            if (this.$props.jsonData) {
                let frames = Object.values(this.$props.jsonData)
                this.$data.eyebrowScores = scale0to100(frames.map(each => each["eyebrow_raise_score"]))
                this.$data.raised        = frames.map(each => each["raised"])
                this.$data.mouthOpenness = frames.map(each => each["mouth_openness"])
            }
        }
    },
    mounted() {
        this.updateValues()
        window.getNames = ()=> this.names
    },
}
</script>

<style scoped>
.side-tab {
    position: relative;
    margin: auto;
    top: 0;
    height: auto;
    width: auto;
    overflow: visible;
}
.side-tab.ui-collapsible__body {
    overflow: visible;
}
.my-graph {
    /* transform: rotate(90deg); */
}
</style>