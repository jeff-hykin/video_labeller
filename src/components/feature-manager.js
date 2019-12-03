import Vue from "vue"
import fs, { write } from "fs"
import path from 'path'

import LabelRecord from '@/util/LabelRecord'
import { barMeasure } from '@/components/bar-measure'
import { videoComponent } from '@/components/video-component'
import { statelessData } from '@/pages/Home.vue'
import { settingsPanel } from "@/components/settings-panel"

export let featureManager = {}
export default {
    beforeCreate() {
        featureManager = this
    },
    data() {
        return {
            labels: {},
            videoLabelData: null,
            dataIsSaved: true,
        }
    },
    mounted() {
        this.pendingRecords = []
        
        // when user tries to save the data
        settingsPanel.$on("saveData" , (eventObj)=>{
            this.saveData()
        })
        // when open new video
        settingsPanel.$on("saveDataThenLoad" , (eventObj)=>{
            eventObj()
        })
        // when video starts playing, make sure to start recording
        videoComponent.$on("play" , (eventObj)=>{
            this.startRecordingFeature()
            this.recordValue(barMeasure.currentValue())
        })
        videoComponent.$on("pause", (eventObj)=>{
            this.stopRecoringFeature()
        })
        // when the video source changes
        videoComponent.$watch("currentVideoFilePath", (eventObj)=>{
            this.loadData()
        })
        // whenever the input changes
        barMeasure.$on('newCurrentValue', (newCurrentValue)=>{
            if (!videoComponent.paused) {
                this.recordValue(newCurrentValue)
            }
        })
        // every 1 second of play time, add a record even if the user hasnt done anything
        setInterval(() => {
            if (!videoComponent.paused) {
                this.recordValue(barMeasure.currentValue())
            }
        }, 1000)
    },
    computed: {
        jsonFilePath() {
            let directory = path.dirname(videoComponent.currentVideoFilePath)
            let basename = path.basename(videoComponent.currentVideoFilePath)
            return path.join(directory, basename+".features.json")
        },
    },
    methods: {
        allRecords() {
            let currentTime  = videoComponent.currentTime
            if (this.pendingRecords.length > 0) {
                let lastValue = this.pendingRecords[this.pendingRecords.length-1][1]
                // add (ficticiously) the last/current data point
                // this datapoint will be removed with the next mouse movement
                // and if it is never removed it won't harm anything since it is a duplicate
                let tempRecord = this.pendingRecords.concat([[currentTime, lastValue]])
                // commit the pending changes
                this.updateRecordsWith(tempRecord)
            }
            let dataCopy = {...this.videoLabelData}
            for (let each in dataCopy) {
                dataCopy[each] = dataCopy[each].records
            }
            return dataCopy
        },
        recordValue(value) {
            let time = videoComponent.currentTime-0
            this.pendingRecords.push([ time, value ])
        },
        startRecordingFeature() {
            this.pendingRecords = []
            this.dataIsSaved = false
        },
        stopRecoringFeature() {
            this.updateRecordsWith(this.pendingRecords)
        },
        updateRecordsWith(records) {
            // if the label doesn't exist yet
            if (!(this.videoLabelData[this.settings.currentFeatureName] instanceof LabelRecord)) {
                // create a LabelRecord for it
                this.videoLabelData[this.settings.currentFeatureName] = new LabelRecord({
                    records: records
                })
            // if the label is a LabelRecord
            } else {
                // then just add the new data
                this.videoLabelData[this.settings.currentFeatureName].addNewRecordSegment(records)
            }
        },
        saveData() {
            // 
            // Save the file
            // 
            let jsonFilePath = this.jsonFilePath
            fs.writeFile(jsonFilePath, JSON.stringify(this.videoLabelData), _=>console.log(`data written to ${jsonFilePath}`))
            this.$toasted.show(`Data written to '${path.basename(jsonFilePath)}'`, {keepOnHover:true}).goAway(6500)
            this.dataIsSaved = true
        },
        loadData() {
            this.videoLabelData = {}
            this.pendingRecords = []
            // try loading any existing data
            let filePath = this.jsonFilePath
            let newVideoData = {}
            if (fs.existsSync(filePath)) {
                try {
                    newVideoData = JSON.parse(fs.readFileSync(filePath))
                    this.$toasted.show(`Previous data file loaded`).goAway(2500)
                } catch (err) {
                }
            }
            // load up the labels
            for (let eachKey in newVideoData) {
                let labelData = JSON.parse( JSON.stringify( newVideoData[eachKey]))
                // if its at least kind of formatted correctly
                if (labelData instanceof Array) {
                    // then convert it to being a LabelRecord
                    newVideoData[eachKey] = new LabelRecord({
                        records: labelData
                    })
                }
            }
            // once all the LabelRecords are created, update the video data
            let labels = {}
            for (let each in newVideoData) {
                labels[each] = true
            }
            this.labels = labels
            this.videoLabelData = newVideoData
            this.dataIsSaved = true
        }
    }
}
