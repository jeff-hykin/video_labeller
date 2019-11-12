<template>
    <row class=wrapper align-h=left >
        <!-- Settings Panel -->
        <column align-h=left align-v=top v-bind:class="['panel', {init}]" shadow=2>
            <ui-textbox label="Feature" placeholder="Name of the feature being labelled" v-model="currentFeatureName" />
            <br><br><br><br>
            <h5>Settings</h5>
            <br>
            <ui-textbox label="Skip Back Amount (Seconds)" v-model="skipBackAmount" />
            <br>
            <ui-textbox label="Video Speed Multiplier" v-model="videoSpeedMultiplier" />
            <!-- <ui-textbox style="margin-top: 1.5rem" :multi-line="true" label="Videos" v-model="videoList" /> -->
        </column>
        <!-- Settings panel gost -->
        <div class=panel-ghost ></div>
        <!-- Main Section -->
        <div class=main-area @mouseenter="mouseEnter" @mouseleave="mouseExit">
            <row class=video-area align-h=left align-v=top>
                <!-- Mouse Height-Measure Bar -->
                <column ref=mouseMeasure class=bar-measure-container shadow=2>
                    <div class=bar-cursor :style="`position: absolute; top: ${prevMousePageYPosition}px;`" >
                        {{Math.floor(mouseHeightPercentage*100)}}%
                    </div>
                </column>
                <!-- Current Video -->
                <column align-h=left align-v=top overflow=auto height=100%>
                    <how-to v-if='!currentVideoFilePath' />
                    <video ref=video v-if='currentVideoFilePath' @pause=onPauseVideo @play=onPlayVideo @click=videoClicked controls>
                        <source :src="videoFileUrl" type="video/mp4">
                    </video>
                </column>
            </row>
            <!-- The bottom bar -->
            <row class=bottom-bar ref=bottomBar >
                <!-- Graph Switch -->
                <column position=absolute left=2rem top=2rem color=white>
                    <ui-switch v-model="showGraph">Show Graph</ui-switch>
                </column>
                <!-- File Area -->
                <column width=100%>
                    <row align-h=center width=100% min-width=min-content>
                        <!-- <input @change="openFolder" type="file" webkitdirectory /> -->
                        <row padding='0 1rem'>
                            <input class=file-picker type="file" tabIndex="-1" @change="chooseFile" placeholder="Choose Video" />
                            <ui-textbox class='youtube-link-input' placeholder="Paste YouTube link" v-model="youtubeLink" />
                            <ui-button 
                                @click="saveData"
                                class="save-button"
                                color="primary"
                                raised
                                :style="{marginLeft: '2rem', visibility:this.verifiedFeatureRecord!=null?'visible':'hidden'}"
                                >
                                Save
                            </ui-button>
                        </row>
                    </row>
                    <!-- Graph -->
                    <div v-if=showGraph style="width: calc(100% + 6rem); margin-bottom: -3rem;" >
                        <graph :duration='this.$refs.video && Math.ceil(this.$refs.video.duration)' :jsonData="this.verifiedFeatureRecord ? {...this.videoLabelData, [this.currentFeatureName]: this.verifiedFeatureRecord.records} : this.videoLabelData" />
                    </div>
                </column>
            </row>
        </div>
    </row>
</template>
<script>
import fs, { write } from "fs"
import { remote } from "electron"
import VueJsonPretty from 'vue-json-pretty'
import path from 'path'
import ytdl from 'ytdl-core'
import HowTo from '../components/how-to'
import Graph from '../components/graph'
import { onWheelFlick, binSearch } from '../util/all'

let dialog = remote.dialog
let app = remote.app

// prevent scrollbars that shouldn't be there
document.body.style.overflow = 'hidden'

let util = require("util")
const readdir = util.promisify(fs.readdir)
const stat = util.promisify(fs.stat)

class FeatureRecord {
    constructor() {
        this.records = []
    }
    addNewRecords(record) {
        if (record.length != 0) {
            // extract start and end times
            let oldestRecord = record[0]
            let newestRecord = record[record.length-1]
            let startTime    = oldestRecord[0]
            let endTime      = newestRecord[0]
            // 
            // remove all of the records times that are in this record's duration
            // replace them with the new records
            // 
            let startIndex = null
            let endIndex = null
            for (let eachIndex in this.records) {
                // convert to number
                eachIndex = eachIndex-0
                
                let [eachTime, eachValue] = this.records[eachIndex]
                if (startIndex == null && eachTime >= startTime) {
                    startIndex = eachIndex
                }
                if (endIndex == null && eachTime >= endTime) {
                    if (eachTime == endTime) {
                        endIndex = (eachIndex-0)+1
                    } else {
                        endIndex = eachIndex
                    }
                }
            }
            if (startIndex == null) {
                startIndex = this.records.length
            }
            if (endIndex == null) {
                endIndex = this.records.length
            }
            let firstPart = this.records.slice(0, startIndex)
            let lastPart = this.records.slice(endIndex, this.records.length)
            this.records = firstPart.concat(record, lastPart)
        }
    }
}
export default {
    name: "main-page",
    components: { VueJsonPretty, HowTo, Graph },
    data: ()=>({
        currentVideoFilePath: null,
        videoFileUrl: null,
        currentFeatureName: "testFeature1",
        currentFeatureValue: 0,
        verifiedFeatureRecord: null,
        prevMousePageYPosition: 0,
        init: true,
        allowedToCaptureWindowKeypresses: false,
        videoList: "",
        youtubeLink: "",
        videoSpeedMultiplier: 1.4,
        skipBackAmount: 5, // seconds
        mouseHeightPercentage: 0,
        showGraph: false,
        videoLabelData: {},
    }),
    mounted() {
        this.recordedFeatures = []
        // have an initial value that gets turned to false (for css classes)
        setTimeout(_=>this.init = false, 1300)
        // pause the video whenever the mouse goes outside of the frame
        document.body.addEventListener('mouseleave', (e)=>{
            this.pauseVideo()
        })
        // record the mouse movements whenever the video is playing
        window.addEventListener('mousemove', (e)=>{
            this.prevMousePageYPosition = e.pageY
            this.saveMousePosition(e)
        })
        window.addEventListener('click', (e)=>{
            // if video is playing
            if (!this.isPaused()) {
                e.preventDefault()
                this.pauseVideo()
            }
        })
        window.addEventListener('wheel', (e)=>{
            onWheelFlick(e, ()=>this.increaseVideoSpeed(), ()=>this.decreaseVideoSpeed())
        })
        window.addEventListener('keydown', (e)=>{
            if (this.allowedToCaptureWindowKeypresses) {
                if (e.code == 'Space') {
                    e.preventDefault()
                    this.togglePlayPause()
                } else if (e.code == 'ArrowLeft' || e.key == 'a') {
                    e.preventDefault()
                    this.skipBack()
                } else if (e.code == 'ArrowRight') {
                    e.preventDefault()
                } else if (e.code == 'ArrowUp' || e.key == 'w') {
                    e.preventDefault()
                    this.increaseVideoSpeed()
                } else if (e.code == 'ArrowDown' || e.key == 's') {
                    e.preventDefault()
                    this.decreaseVideoSpeed()
                } else if (e.code == 'BracketRight') {
                } else if (e.code == 'BracketLeft') {
                    
                }
            }
        })
        setInterval(_=>{
            // update the feature record
            if (this.verifiedFeatureRecord) {
                this.saveMousePosition({})
                this.verifiedFeatureRecord.addNewRecords(this.recordedFeatures)
                this.recordedFeatures = []
                // update the videoLabelData
                this.videoLabelData[this.currentFeatureName] = this.verifiedFeatureRecord.records
            }
        }, 300)
    },
    computed: {
        jsonFilePath() {
            let directory = path.dirname(this.currentVideoFilePath)
            let basename = path.basename(this.currentVideoFilePath)
            return path.join(directory, basename+".features.json")
        }
    },
    watch: {
        youtubeLink(url) {
            if (typeof url == 'string') {
                if (ytdl.validateURL(url)) {
                    let localPath =  path.resolve(app.getPath("desktop"), path.basename(url))
                    let videoPath = dialog.showSaveDialog({ defaultPath: localPath })+'.mp4'
                    let writeStream = fs.createWriteStream(videoPath)
                    writeStream.on('close', ()=>{
                        this.$toasted.show(`Finished download`).goAway(2500)
                        // chop off the first character
                        this.currentVideoFilePath = videoPath.slice(1,999999999)
                        this.openVideo()
                        this.youtubeLink = null
                    })
                    this.$toasted.show(`Starting youtube video download`).goAway(2500)
                    ytdl(url, { filter: (format) => format.container === 'mp4' }).pipe(writeStream)
                }
            }
        }
    },
    methods: {
            mouseEnter() {
                this.allowedToCaptureWindowKeypresses = true;
            },
            mouseExit() {
                this.allowedToCaptureWindowKeypresses = false;
            },
        // 
        // Data recording methods
        // 
            startRecordingFeature() {
                this.recordedFeatures = []
            },
            stopRecoringFeature() {
                this.verifiedFeatureRecord.addNewRecords(this.recordedFeatures)
            },
            saveMousePosition(e) {
                let videoElement = this.$refs.video
                let yPosition = (e.pageY == null) ? this.prevMousePageYPosition : e.pageY
                if (this.$refs.mouseMeasure) {
                    let range = this.$refs.mouseMeasure.$el.clientHeight
                    if (yPosition > range) {
                        this.mouseHeightPercentage = 0
                    } else {
                        this.mouseHeightPercentage = 1 - (yPosition / range)
                    }
                }
                if (videoElement && !videoElement.paused) {
                    let time = videoElement.currentTime
                    this.recordedFeatures.push([ time, this.mouseHeightPercentage ])
                }
            },
        // 
        // Video Methods
        //
            isPaused() {
                try {
                    return this.$refs.video.paused
                } catch (e) {
                    return true
                }
            },
            togglePlayPause() {
                let videoElement = this.$refs.video
                if (videoElement.paused) {
                    videoElement.play()
                } else {
                    videoElement.pause()
                }
            },
            pauseVideo() {
                try {
                    this.$refs.video.pause()
                } catch (e) {
                    
                }
            },
            onPlayVideo(e) {
                this.startRecordingFeature()
                this.saveMousePosition(e)
            },
            onPauseVideo() {
                let videoElement = this.$refs.video
                this.stopRecoringFeature()
            },
            onVideoEnd() {
                this.stopRecoringFeature()
            },
            videoClicked(e) {
                // catch the event and prevent it from going up to the window-clicked event
                e.stopPropagation()
                this.togglePlayPause()
            },
            skipBack() {
                let video = this.$refs.video
                if (video) {
                    this.stopRecoringFeature()
                    video.currentTime -= this.skipBackAmount
                    this.startRecordingFeature()
                }
            },
            changeVideoSpeed(multiplier) {
                let video = this.$refs.video
                if (video) {
                    // increase the speed by the videoSpeedMultiplier
                    let currentRate = video.playbackRate
                    let newRate = currentRate * multiplier
                    // if the rate is close to 1, then round it to 1 to prevent weird precision errors
                    if (newRate+0.05 > 1 && newRate-0.05 < 1) {
                        newRate = 1
                    }
                    video.playbackRate = newRate
                    this.$toasted.show(`Speed x${Math.floor(newRate*100)/100}`).goAway(1000)
                }
            },
            increaseVideoSpeed() {
                this.changeVideoSpeed(this.videoSpeedMultiplier)
            },
            decreaseVideoSpeed() {
                this.changeVideoSpeed(1/this.videoSpeedMultiplier)
            },
        // 
        // other methods
        // 
            bottomBarHeight() {
                let output = '0'
                if (this.$refs.bottomBar) {
                    output = `${this.$refs.bottomBar.$el.clientHeight}px`
                } else {
                    setTimeout(_=>this.$forceUpdate(),0)
                }
                return output
            },
            saveData() {
                let jsonFilePath = this.jsonFilePath()
                
                let dataToSave = {
                    [this.currentFeatureName]: this.verifiedFeatureRecord.records 
                }
                
                // 
                // try opening the existing (old) file if it is already there
                // 
                let oldData = null
                try {
                    oldData = JSON.parse(fs.readFileSync(jsonFilePath))
                } catch (e) {
                    
                }
                if (oldData) {
                    // preserve other values
                    dataToSave = { ...oldData, ...dataToSave }
                    if (oldData[this.currentFeatureName] instanceof Array) {
                        // 
                        // combine the new and old data at the timestamp level (give the new data precedence over the old data in a conflict)
                        // 
                        try {
                            let existingRecord = new FeatureRecord()
                            existingRecord.addNewRecords(this.verifiedFeatureRecord.records)
                            dataToSave[this.currentFeatureName] = existingRecord.records
                        } catch (e) {
                            // do nothing if the old data is corrupt
                        }
                    }
                }
                
                // 
                // Save the file
                // 
                fs.writeFile(jsonFilePath, JSON.stringify(dataToSave), _=>console.log(`data written to ${jsonFilePath}`))
                this.$toasted.show(`Data written to '${path.basename(jsonFilePath)}'`, {keepOnHover:true}).goAway(6500)
            },
            open(link) {
                this.$electron.shell.openExternal(link)
            },
            chooseFile(e) {
                this.currentVideoFilePath = e.target.files[0].path
                this.openVideo()
            },
            openVideo() {
                this.videoLabelData = {}
                this.videoFileUrl = `file:///${this.currentVideoFilePath}`
                // for some reason the source doesn't update itself so this manually updates it
                this.$refs.video && (this.$refs.video.src = this.videoFileUrl)
                this.verifiedFeatureRecord = new FeatureRecord()
                let filePath = this.jsonFilePath
                if (fs.existsSync(filePath)) {
                    this.videoLabelData = JSON.parse(fs.readFileSync(filePath))
                    if (this.videoLabelData[this.currentFeatureName] instanceof Array) {
                        this.verifiedFeatureRecord.records = this.videoLabelData[this.currentFeatureName]
                    }
                }
            },
            async openFolder(e) {
                let folderPath = e.target.files[0].path
                let files = await readdir(folderPath)
                let imagePaths = []
                for (let eachFilePath of files) {
                    if (eachFilePath.match(/\.png$/)) {
                        imagePaths.push(eachFilePath)
                    }
                }
            },
    },
}

</script>
<style scoped>
    @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');
    @import url('https://fonts.googleapis.com/css?family=Roboto:100,300,400&display=swap');
    
    .ui-button {
        padding: 0.8em 1.7em;
    }
    
    video {
        height: -webkit-fill-available;
        width: auto;
    }
    
    
    .wrapper {
        background: radial-gradient( ellipse at top left, rgba(255, 255, 255, 1) 40%, rgba(229, 229, 229, .9) 100%);
        width: 100vw;
        --bar-measure-width: 5rem;
        --unhovered-panel-amount: 3rem;
        --blue: #2196F3;
        --green: #64FFDA;
        --red: #EF5350;
    }
    
    .wrapper .bar-measure-container {
        min-width: 3rem;
        height: 100%;
        background: linear-gradient(0deg, rgba(255,104,100,1) 0%, rgba(73,227,203,1) 52%, rgba(0,114,255,1) 100%);
    }
    .wrapper .bar-measure {
        height: calc(20vh + 2px);
        margin-top: -1px;
        margin-bottom: -1px;
        width: var(--bar-measure-width);
        opacity: 0.5;
    }
    .wrapper .bar-cursor {
        z-index: 1;
        width: fit-content;
        height: fit-content;
        padding: 0.5rem 1rem 0.5rem calc(0.5rem + var(--unhovered-panel-amount));
        background: var(--red);
        border: white 4px solid;
        border-radius: 100vh;
        box-sizing: content-box;
        left: 0;
        color: white;
        transform: translateY(-50%);
    }
    
    * {
        margin: 0;
        padding: 0;
    }
    
    .file-picker {
        width: 16rem;
        background-color: whitesmoke;
        border: 1rem solid whitesmoke !important;
        border-radius: 100vh;
    }
    .corner-popover {
        font-family: Roboto;
        font-weight: 100;
        font-size: 14pt;
        margin-left: 1rem;
        margin-right: 1rem;
        color: #eeeeee;
        text-decoration: underline;
    }
    .json-popover {
        min-height: 7rem;
        min-width: 30vw;
        width: 20rem;
        overflow: auto;
    }
    .video-area {
        height: -webkit-fill-available;
        width: -webkit-fill-available;
    }
    .bottom-bar {
        z-index: 10;
        min-height: fit-content;
        width: -webkit-fill-available;
        box-shadow: rgba(0, 0, 0, -0.86) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px, rgba(0, 0, 0, 0.3) 0px 2px 4px -1px;
        max-width: 100vw;
        position: relative;
        background-color: var(--teal);
        padding: 2rem 3rem;
        padding-top: 1rem;
        /* transition: all 500ms ease-out; */
    }
    .main-area {
        height: 100vh;
        flex-grow: 1;
        justify-content: space-between;
        align-items: flex-start;
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        margin: 0;
    }
    .panel.init {
        transform: translateX(0);
    }
    .wrapper .panel {
        position: fixed;
        min-width: 22rem;
        transform: translateX(calc(-100% + var(--unhovered-panel-amount) + 3px));
        transition: all 500ms ease-out;
        background-color: whitesmoke;
        height: 100vh;
        left: 0;
        z-index: 11;
        padding: 2rem 3rem;
    }
    .panel:hover {
        transform: translateX(0);
    }
    .wrapper .panel-ghost {
        min-width: var(--unhovered-panel-amount);
    }
    
    .youtube-link-input {
        margin: 1rem 2rem;
    }
    >>>.youtube-link-input input::placeholder {
        color: white;
    }
    >>>.youtube-link-input label {
        border-bottom: white solid;
    }
</style>
