<template>
    <row class=wrapper >
        <!-- Mouse Height-Measure Bar -->
        <column class=bar-measure-container shadow=2 z-index=10>
            <div class=bar-measure style='background: var(--blue); ' ></div>
            <div class=bar-measure style='background: var(--green);' ></div>
            <div class=bar-measure style='background: gray; ' ></div>
            <div class=bar-measure style='background: var(--green);' ></div>
            <div class=bar-measure style='background: var(--blue); ' ></div>
            <div class=bar-cursor :style="`position: absolute; top: ${prevMousePageYPosition}px;`" ></div>
        </column>
        <!-- Settings Panel -->
        <column align-v=top v-bind:class="['panel', {init}]" shadow=2>
            <ui-textbox label="Feature" placeholder="Name of the feature being labelled" v-model="currentFeatureName" />
            <!-- <ui-textbox style="margin-top: 1.5rem" :multi-line="true" label="Videos" v-model="videoList" /> -->
        </column>
        <!-- Main Section -->
        <div class=middle-container @mouseenter="mouseEnter" @mouseleave="mouseExit">
            <!-- Current Video -->
            <column align-h=left align-v=top :max-height='`calc(100vh - ${bottomBarHeight()})`' max-width='100vw' overflow=auto>
                <column align-h=left align-v=top margin=2rem v-if='!currentVideoFilePath'>
                    <h2>What does this app do?</h2>
                    <p>
                        It records the height of your mouse (as a percent) while a video is playing so that you can continuously label a video.
                        For example, you could label a video with mouse movements that corrispond to how happy you think the person in the video is.
                    </p>
                    <h2>How exactly do I use it?</h2>
                    <p>
                        1. First open up the settings panel all the way over to the &lt;- left (just hover your mouse over it)
                    </p>
                    <p>
                        2. Then add the name of the feature you are labelling
                    </p>
                    <p>
                        3. Open up a video
                    </p>
                    <p>
                        4. Use the spacebar to pause/play the video<br>
                        (the mouse movements are automatically recorded when the video is playing)
                    </p>
                    <p>
                        5. Press the blue save button to save the data for that video
                    </p>
                    <h2>How is the data formatted?</h2>
                    <p>
                        The data is in a JSON format like this.
<pre>
{
    "your-feature-name": [
        // first mouse position
        [
            0.0, // the video time (in seconds)
            0.5  // the mouse position as a percent (this is 50%)
        ],
        // the next mouse movement
        [
            14.2, // the current video time (in seconds)
            0.2   // the mouse position (this is 20% above the bottom)
        ],
        // the next mouse movement
        [
            15.7, // the current video time (in seconds)
            0.3   // the mouse position (this is 30% above the bottom)
        ],
    ]
}
</pre>
                    </p>
                </column>
                <video ref=video v-if='currentVideoFilePath' @pause=onPauseVideo @play=onPlayVideo @click=videoClicked controls>
                    <source :src="videoFileUrl" type="video/mp4">
                </video>
            </column>
            <!-- The bottom bar -->
            <row class=bottom-bar ref=bottomBar max-width=100vw position=relative background-color=var(--teal) padding='2rem 3rem' padding-top='1rem'>
                <column width=100%>
                    <!-- <div class="popover-trigger" style="position:absolute; top: 0; left: 0;">
                        <p class=corner-popover style='padding: 0.7rem;'>Options</p>
                        <ui-popover open-on="mouseenter">
                            <column padding='2rem' min-height=10rem>
                                <ui-switch v-model="showPoints">Show X's</ui-switch>
                            </column>
                        </ui-popover>
                    </div> -->
                    <!-- <row padding='0.5rem' position=relative top='-0.5rem'>
                        <pre v-if="this.currentImagePath != null">{{this.currentImagePath}}</pre>
                    </row> -->
                    <row align-h=center width=100% min-width=min-content>
                        <!-- <b-button class="back-button" @click="prevImage" :style="{visibility:showBackButton?'visible':'hidden'}">
                            Back
                        </b-button> -->
                        <!-- <input @change="openFolder" type="file" webkitdirectory /> -->
                        <row padding='0 1rem'>
                            <input class=file-picker type="file" @change="chooseFile" />
                            <ui-textbox class='youtube-link-input' placeholder="Paste YouTube link" v-model="youtubeLink" />
                            <b-button variant="primary" class="save-button" @click="saveData" :style="{marginLeft: '2rem', visibility:this.verifiedFeatureRecord!=null?'visible':'hidden'}">
                                Save
                            </b-button>
                        </row>
                        
                        <!-- <b-button class="next-button" @click="nextImage" :style="{visibility:showNextButton?'visible':'hidden'}">
                            Next
                        </b-button> -->
                    </row>
                    
                    <!-- <div v-if="this.data" class="popover-trigger" style="position:absolute; top: 0; right: 10rem;">
                        <p class=corner-popover style='padding: 0.7rem;'>Graph</p>
                        <ui-popover open-on="click">
                            <column padding='2rem' min-height=10rem>
                                <graph :jsonData="data" />
                            </column>
                        </ui-popover>
                    </div> -->
                    
                    <!-- <div class="popover-trigger" style="position:absolute; top: 0; right: 0;">
                        <p class=corner-popover style='padding: 0.7rem;'>FrameData</p>
                        <ui-popover class=json-popover open-on="click">
                            <row width=100vw height=100% align-v=top align-h=left padding=1rem>
                                <vue-json-pretty :data="frameData" />
                            </row>
                        </ui-popover>
                    </div> -->
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
import Vue from 'vue'

import Graph from "./LandingPage/graph"
import Point from "./LandingPage/Draggable"
import Column from './LandingPage/column'
import Row from './LandingPage/row'
import ytdl from 'ytdl-core'

let dialog = remote.dialog
let app = remote.app

// ytdl('http://www.youtube.com/watch?v=A02s8omM_hI', { filter: (format) => format.container === 'mp4' }).pipe(fs.createWriteStream('video.mp4'))

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
    components: { Point, Column, Row, VueJsonPretty, Graph },
    data: ()=>({
        currentVideoFilePath: null,
        videoFileUrl: null,
        currentFeatureName: "testFeature1",
        currentFeatureValue: 0,
        verifiedFeatureRecord: null,
        prevMousePageYPosition: 0,
        init: true,
        keypressActive: false,
        videoList: "",
        youtubeLink: "",
    }),
    mounted(){
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
        window.addEventListener('keydown', (e)=>{
            if (this.keypressActive) {
                if (e.code == 'Space') {
                    e.preventDefault()
                    this.togglePlayPause()
                } else if (e.code == 'ArrowLeft') {
                    e.preventDefault()
                    // TODO
                } else if (e.code == 'ArrowRight') {
                    e.preventDefault()
                    // TODO
                }
            }
        })
    },
    computed: {
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
                this.keypressActive = true;
            },
            mouseExit() {
                this.keypressActive = false;
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
                if (videoElement && !videoElement.paused){
                    let yPosition = (e.pageY == null) ? this.prevMousePageYPosition : e.pageY
                    let mouseHeightPercentage = 1 - (yPosition / window.innerHeight)
                    let time = videoElement.currentTime
                    if (!this.recordedFeatures) {
                        this.recordedFeatures = []
                    }
                    this.recordedFeatures.push([ time, mouseHeightPercentage ])
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
                let directory = path.dirname(this.currentVideoFilePath)
                let basename = path.basename(this.currentVideoFilePath)
                let jsonFilePath = path.join(directory, basename+".features.json")
                
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
                this.videoFileUrl = `file:///${this.currentVideoFilePath}`
                // for some reason the source doesn't update itself so this manually updates it
                this.$refs.video && (this.$refs.video.src = this.videoFileUrl)
                
                this.verifiedFeatureRecord = new FeatureRecord()
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
    
    
    .wrapper {
        background: radial-gradient( ellipse at top left, rgba(255, 255, 255, 1) 40%, rgba(229, 229, 229, .9) 100%);
        width: 100vw;
        --bar-measure-width: 5rem;
        --blue: #2196F3;
        --green: #64FFDA;
        --red: #EF5350;
    }
    
    .wrapper .bar-measure-container {
        min-width: var(--bar-measure-width);
    }
    .wrapper .bar-measure {
        height: calc(20vh + 2px);
        margin-top: -1px;
        margin-bottom: -1px;
        width: var(--bar-measure-width);
        opacity: 0.5;
    }
    .bar-cursor {
        width: 3rem;
        height: 1rem;
        background: var(--red);
        border-radius: 15px;
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
    .json-area {
    }
    .bottom-bar {
        width: -webkit-fill-available;
        box-shadow: rgba(0, 0, 0, -0.86) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px, rgba(0, 0, 0, 0.3) 0px 2px 4px -1px;
    }
    .middle-container {
        max-width: calc(100vw - var(--bar-measure-width));
        min-height: 100vh;
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
    .panel {
        position: fixed;
        min-width: 22rem;
        transform: translateX(-90%);
        transition: all 500ms ease-out;
        background-color: whitesmoke;
        height: 100vh;
        left: 0;
        z-index: 11;
        padding: 2rem;
    }
    .panel:hover {
        transform: translateX(0);
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
    
    button {
        height: min-content;
    }
    video {
        height: -webkit-fill-available;
    }
</style>
