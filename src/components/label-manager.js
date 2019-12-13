import Vue from "vue"
import fs, { write } from "fs"
import path from 'path'

import { binSearch } from '@/util/all'

import { barMeasure } from '@/components/bar-measure'
import { videoComponent } from '@/components/video-component'
import { statelessData } from '@/pages/Home.vue'
import { settingsPanel } from "@/components/settings-panel"
import { graphComponent } from "../components/graph.vue"

// TODO:
    // fix the edgecase of video start

// 
// summary
// 
    // this component keeps track of recording user input
    // internal responsibilities:
    //  - choose the format of saving data to/from a file
    //  - listen to changes of user input and record them efficiently in real time
    //  - listen to changes in settings and change accordingly
    //  - format the data in a way that the graph component can display it 
    // external responsibilities
    //  - keep track of `dataIsSaved` so the settings component can know
    //  - keep `labelToggles` up to date with label names
    // 
    // how does data get loaded?
    //  - this component listens to the `currentVideoFilePath` to know when the video changed
    //  - it loads new data from a file whenever the video changes
    // 
    // how does data get saved?
    //  - this component listens to whenever the settings tells it to `saveData` or `saveDataThenLoad`
    //  - it only saves data when the settings panel asks it to save data
    // 
    // how does recording a new value work?
    //  - 1. whenever the user presses play (the videoComponent `play` event)
    //       for the currentLabel (the one named in the settings panel)
    //          figure out where (in time) the user just started playing the video
    //          find the closest currentLabel.record that comes chronologically after that start time 
    //          (a "record" in this context is a [timeInSeconds, userValue])
    //          remember that record as the chronologically next record
    //       every label has likely has a long array of records that
    //       is (or should) be stored in chonological order
    //  - 2. when recording a new record from the user
    //       if the new record is BEFORE the chronologically next record
    //       then just insert the new record right before it
    //       however, if new record is AFTER chronologically next record
    //       then REMOVE the chronologically next record (overwrite)
    //          in fact remove all of the values after the chronologically next record and before the new record
    //          If this removal never happened, then re-recording the same time segment
    //          would effectively destroy both the old and new recording
    //          because the data would be merged on top of eachother (because recordings are points not a curve)
    //       then insert the new record
    //       then update chronologically next record to be the the record after the one that was just inserted
    // 
    // when are new values recorded?
    //  - 1. every time barMeasure gets a `newCurrentValue` (caused by mouse/keyboard events)
    //  - 2. every time the graph asks for all of the records `allRecords` method
    //  - 3. every time the user presses play (videoComponent `play` event)
    //  - 4. every time the user presses pause (videoComponent `pause` event)
    // 
    // how does the manager know what the current label is?
    //  - 1. it waits until a video is loaded by looking at `currentVideoFilePath`
    //       once a video is loaded it then retreives or generates a label object
    //  - 2. whenever the settingsPanel `currentLabelName` changes
    //       it removes any previous empty names (likely intermediate as-user-was-typing names)
    //       it then retreives or generates a label object

// the optimizer removes duplicate values
// this limit will prevent it from revoving duplicates if they are far enough away in time
const OPTIMIZER_LIMIT = 0.5 // seconds

// helpers
let currentTime = () => videoComponent.currentTime-0
let currentValue = () => barMeasure.currentValue()
let currentLabel = null
let nextChronologicalRecordIndex = 0

export let labelManager = {}
export default {
    beforeCreate() {
        // assign the (exported) labelManager variable so that other files can import this component
        labelManager = this
    },
    data() {
        return {
            labels: [],
            labelToggles: {},
            dataIsSaved: true,
        }
    },
    mounted() {
        // 
        // saving/loading data
        // 
        settingsPanel.$on("say:saveDataToFile" , (eventData) => {
            this.saveDataToFile(eventData)
        })
        videoComponent.$watch("currentVideoFilePath", (eventData) => {
            // setup the data
            this.loadData()
        })


        // 
        // inserting records
        // 
        barMeasure.$on('newCurrentValue', (newCurrentValue)=>{
            // if the video is playing
            if (!videoComponent.paused) {
                // then record a new value
                this.insertRecord(currentTime(), newCurrentValue)
            }
        })
        videoComponent.$on("pause", (eventData)=> {
            this.insertRecord(currentTime(), currentValue())
        })
        videoComponent.$on("ended", (eventData)=> {
            this.insertRecord(eventData.target.duration, currentValue())
        })
        // this will be triggered after the video play event
        this.$on("finished:resetTheNextChonologicalRecord", ({ currentTime, currentValue })=> {
            this.insertRecord(currentTime, currentValue)
        })
        graphComponent.$on("say:graphUpdateRequest", (eventData) => {
            this.insertRecord(currentTime(), currentValue())
            this.$emit("say:graphShouldUpdate")
        })

        // 
        // reseting nextChronologicalRecordIndex
        // 
        videoComponent.$on("play" , (eventData)=> {
            // reset the value
            this.resetTheNextChonologicalRecord(currentTime(), currentValue())
        })
        videoComponent.$on("say:skipBack" , (eventData)=> {
            // reset the value
            this.resetTheNextChonologicalRecord(currentTime(), currentValue())
        })
        videoComponent.$on("say:skipForward" , (eventData)=> {
            // reset the value
            this.resetTheNextChonologicalRecord(currentTime(), currentValue())
        })
        
        // 
        // label changes
        // 
        this.$on("finished:loadData", (eventData) => {
            // setup the current label
            this.labelNameChanged()
        })
        settingsPanel.$watch("settings.currentLabelName", (eventData) => {
            this.labelNameChanged()
        })

        
        // every 1 second of play time, add a record even if the user hasnt done anything
        setInterval(() => {
            if (!videoComponent.paused) {
                // then record a new value
                this.insertRecord(currentTime(), currentValue())
            }
        }, 1000)
    },
    methods: {
        // how the name of the json file is determined
        jsonFilePath() {
            // generate the json name based on the current videos filepath
            let videoFilePath = videoComponent.currentVideoFilePath
            let directory = path.dirname(videoFilePath)
            let basename = path.basename(videoFilePath)
            return path.join(directory, basename+".labels.json")
        },
        saveDataToFile(eventData) {
            // 
            // combine old/new data
            // 
            let oldData = {}
            let jsonFilePath = this.jsonFilePath()
            if (fs.existsSync(jsonFilePath)) {
                try {
                    oldData = JSON.parse(fs.readFileSync(jsonFilePath))
                } catch (e) {

                }
            }
            let formattedLabels = {}
            for (let each of this.labels) {
                formattedLabels[each.name] = each.data
            }

            // 
            // Save data to file
            // 
            fs.writeFile(jsonFilePath, JSON.stringify({...oldData, ...formattedLabels}), _=>console.log(`data written to ${jsonFilePath}`))
            this.$toasted.show(`Data written to '${path.basename(jsonFilePath)}'`, {keepOnHover:true}).goAway(6500)
            this.dataIsSaved = true
            this.$emit("finished:saveDataToFile", {path:jsonFilePath, ...eventData})
        },
        loadData() {
            // try loading any existing data
            let filePath = this.jsonFilePath()
            let labels = []
            let labelToggles = {}
            if (fs.existsSync(filePath)) {
                let unformattedLabels
                try {
                    unformattedLabels = JSON.parse(fs.readFileSync(filePath))
                    // tell the user there is previous data
                    this.$toasted.show(`Previous data file loaded`).goAway(2500)
                } catch (error) {
                }
                // load up the labels
                for (let eachKey in unformattedLabels) {
                    // create a toggle for each label
                    labelToggles[eachKey] = true
                    // create an entry for each label
                    labels.push({
                        name: eachKey,
                        data: unformattedLabels[eachKey]
                    })
                }
            }
            
            // reset variables
            currentLabel = null
            nextChronologicalRecordIndex = 0
            // update data
            this.labelToggles = labelToggles
            this.labels = labels
            this.dataIsSaved = true
            this.$emit("finished:loadData")
        }, 
        resetTheNextChonologicalRecord(currentTime, currentValue) {
            
            // find the index of first the record that is chronologically after the currentTime
            // TODO: make this a binary search
            nextChronologicalRecordIndex = null
            for (let eachIndex in currentLabel.data) {
                let [ eachTime, eachValue ] = currentLabel.data[eachIndex]
                if (eachTime > currentTime) {
                    nextChronologicalRecordIndex = eachIndex
                    break
                }
            }
            // if no index was found, that means there are no future values to overwrite
            if (nextChronologicalRecordIndex == null) {
                nextChronologicalRecordIndex = currentLabel.data.length-1
            }
            // tell everyone the nextChronologicalRecordIndex was just reset
            this.$emit("finished:resetTheNextChonologicalRecord", {currentTime, currentValue})
        },
        insertRecord(currentTime, currentValue) {
            this.dataIsSaved = false
            let futureRecords = currentLabel.data.slice(nextChronologicalRecordIndex, Infinity)
            // NOTE: while its possible binary search could be faster here, linear search
            // will often be very close or better since this shouldn't contain many values
            // due to how often insertRecord is called
            let numberToDelete = 0
            // some buffer is added to reduce chance of precision errors
            let futureBoundary = currentTime + Number.MIN_VALUE*10
            for (let [eachTime, eachValue] of futureRecords) {
                if (eachTime <= futureBoundary) {
                    numberToDelete++
                } else {
                    break
                }
            }
            
            // 
            // duplicate value prevention (very important)
            // 

            // check to see last 2 records are identical to the current one
            let optimizationUtilized = false
            let previousRecord       = currentLabel.data[nextChronologicalRecordIndex-1]
            let recordBeforePrevious = currentLabel.data[nextChronologicalRecordIndex-2]
            if (previousRecord && recordBeforePrevious) {
                let [ previousTime      , previousValue       ] = previousRecord
                let [ beforePreviousTime, beforePreviousValue ] = recordBeforePrevious
                // if the last three values are equal
                if (beforePreviousValue == currentValue && previousValue == currentValue) {
                    if ((currentTime - beforePreviousTime) < OPTIMIZER_LIMIT) {
                        // then don't insert a new value, just change the time of the previous one
                        previousRecord[0] = currentTime
                        optimizationUtilized = true
                    }
                }
            }
            
            if (optimizationUtilized) {
                // remove old values without inserting
                currentLabel.data.splice(nextChronologicalRecordIndex, numberToDelete)
            } else {
                // remove old values, and insert the new one
                currentLabel.data.splice(nextChronologicalRecordIndex, numberToDelete, [currentTime, currentValue])
                // increment the index since we just added one (all of the ones that were deleted were in the future)
                nextChronologicalRecordIndex++
            }

        },
        labelNameChanged() {
            let newCurrentLabelName = settingsPanel.settings.currentLabelName
            currentLabel = null
            let filteredLabels = []
            let labelToggles = {}
            for (let each of this.labels) {
                if (each.data.length != 0) {
                    filteredLabels.push(each)
                    labelToggles[each.name] = this.labelToggles[each.name]
                    // if the name matches, then update the current label
                    if (each.name == newCurrentLabelName) {
                        currentLabel = each
                    }
                }
            }
            // if the currentLabel wasn't found
            if (currentLabel == null) {
                // then create one
                currentLabel = {
                    name: newCurrentLabelName,
                    data: []
                }
                this.labels.push(currentLabel)
                labelToggles[newCurrentLabelName] = true
            }
            this.labelToggles = labelToggles
        },
    }
}
