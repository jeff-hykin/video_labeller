<template>
    <row class=wrapper align-h=left >
        <!-- Settings Panel -->
        <column align-h=left align-v=top v-bind:class="['panel', {init}]" shadow=2>
            <h5>Video</h5>
            <column class='video-selector bubble' shadow=1>
                <input class=file-picker type="file" tabIndex="-1" accept=".mp4,.mov,.avi,.flv,.wmv" @change="chooseFile" placeholder="Choose Video" />
                <ui-textbox class='youtube-link-input' placeholder="Paste YouTube link" v-model="youtubeLink" />
            </column>
            <row align-h=space-between width=100% padding='1rem 0rem'>
                <ui-textbox placeholder="Name of the feature being labelled" v-model="currentFeatureName" />
                <ui-button 
                    @click="saveData"
                    class="save-button"
                    color="primary"
                    raised
                    :style="{marginLeft: '0rem'}"
                    >
                    Save
                </ui-button>
            </row>
            <br><br><br><br>
            <h5>Settings</h5>
            <column class='settings-bubble bubble' shadow=1 align-h=left>
                <ui-switch v-model="showGraph">Show Graph</ui-switch>
                <br>
                <br>
                <ui-textbox label="Graph Height" v-model="graphHeight" />
                <br>
                <br>
                <ui-textbox label="Skip Back Amount (Seconds)" v-model="skipBackAmount" />
                <br>
                <br>
                <ui-textbox label="Video Speed Multiplier" v-model="videoSpeedMultiplier" />
                <br>
                <br>
                <ui-textbox label="Number of seconds graph should show" v-model="graphRange" />
            </column>
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
                <column align-h=left align-v=top overflow=auto height=100% flex-grow=1>
                    <how-to v-if='!currentVideoFilePath' />
                    <video ref=video @pause=onPauseVideo @play=onPlayVideo @click=videoClicked @seeking=onVideoSeek controls>
                        <source :src="videoFileUrl" type="video/mp4">
                    </video>
                </column>
            </row>
            <!-- The bottom bar -->
            <column class=bottom-bar ref=bottomBar align-h=center >
                <!-- Control  -->
                <!-- <row class=control-bar align-h=space-between width=100% min-width=min-content>
                    <input @change="openFolder" type="file" webkitdirectory />
                </row> -->
                <!-- Graph -->
                <div v-if=showGraph class=graph-container >
                    <graph ref=graph :getData='getGraphData' :height=graphHeight />
                </div>
            </column>
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
import { onWheelFlick, binSearch, once } from '../util/all'
import LabelRecord from '../util/LabelRecord'

let   util    = require("util")
const readdir = util.promisify(fs.readdir)
let   dialog  = remote.dialog
let   app     = remote.app

// prevent scrollbars that shouldn't be there
document.body.style.overflow = 'hidden'

export let statelessData = {
    graph:{},
    graphMin: 0,
    graphMax: 10,
}

export default {
    name: "main-page",
    components: { VueJsonPretty, HowTo, Graph },
    data: ()=>({
        currentFeatureName: "testFeature1",
        verifiedFeatureRecord: null,
        // Video data
        currentVideoFilePath: null,
        prevMousePageYPosition: 0,
        init: true,
        allowedToCaptureWindowKeypresses: false,
        // settings panel
        showGraph: false,
        videoSpeedMultiplier: 1.4,
        skipBackAmount: 5, // seconds
        graphRange: 10, // seconds
        graphHeight: 250, // pixels
        // other
        mouseHeightPercentage: 0,
        youtubeLink: "",
        videoLabelData: null,
        graphFrameRate: 30, // fps
        numberOfChunks: 1,
        getGraphData: ()=>statelessData.graph,
    }),
    mounted() {
        window.main = this
        this.pendingRecords = []
        
        // set the rate for the graph to be updated
        setInterval(this.updateGraph, 1000/this.graphFrameRate)
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
            // uncomment this to allow the scroll to control the video speed
            // onWheelFlick(e, ()=>this.videoLabelData&&this.increaseVideoSpeed(), ()=>this.videoLabelData&&this.decreaseVideoSpeed())
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
    },
    computed: {
        jsonFilePath() {
            let directory = path.dirname(this.currentVideoFilePath)
            let basename = path.basename(this.currentVideoFilePath)
            return path.join(directory, basename+".features.json")
        },
        videoFileUrl() {
            if (this.currentVideoFilePath) {
                return `file://${this.currentVideoFilePath}`
            }
        }
    },
    watch: {
        graphRange(newValue) {
            newValue && this.updateGraph({force: true, noDataChange:true })
        },
        showGraph(newValue) {
            setTimeout(()=>newValue && this.updateGraph({force: true, noDataChange:true }), 0)
        },
        currentVideoFilePath(newValue) {
            if (this.$refs.video) {
                if (newValue) {
                    this.$refs.video.style.visibility = 'visible'
                } else {
                    this.$refs.video.style.visibility = 'hidden'
                }
            }
        },
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
            updateGraph(input) {
                let force        = input && input.force
                let noDataChange = input && input.noDataChange
                
                if (this.$refs.video && this.videoLabelData && (force || !this.isPaused())) {
                    let currentTime  = this.$refs.video.currentTime
                    if (!noDataChange) {
                        if (this.pendingRecords.length > 0) {
                            let lastValue = this.pendingRecords[this.pendingRecords.length-1][1]
                            // add (ficticiously) the last/current data point
                            // this datapoint will be removed with the next mouse movement
                            // and if it is never removed it won't harm anything since it is a duplicate
                            let tempRecord = this.pendingRecords.concat([[currentTime, lastValue]])
                            // commit the pending changes
                            this.updateRecordsWith(tempRecord)
                        }
                        // get the data into a graph-digestible form
                        statelessData.graph = {}
                        for (let each in this.videoLabelData) {
                            statelessData.graph [each] = this.videoLabelData[each].records
                        }
                    }
                    // extract the time segment from the labels
                    statelessData.graphMin = currentTime - this.graphRange/2
                    statelessData.graphMax = currentTime + this.graphRange/2
                    this.getGraphData = ()=>statelessData.graph
                }
            },
            startRecordingFeature() {
                this.pendingRecords = []
            },
            stopRecoringFeature() {
                this.updateRecordsWith(this.pendingRecords)
            },
            updateRecordsWith(records) {
                // if the label doesn't exist yet
                if (!(this.videoLabelData[this.currentFeatureName] instanceof LabelRecord)) {
                    // create a LabelRecord for it
                    this.videoLabelData[this.currentFeatureName] = new LabelRecord({
                        numberOfChunks: this.numberOfChunks,
                        graphFrameRate: this.graphFrameRate,
                        records: records
                    })
                // if the label is a LabelRecord
                } else {
                    // then just add the new data
                    this.videoLabelData[this.currentFeatureName].addNewRecordSegment(records)
                }
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
                    this.pendingRecords.push([ time, this.mouseHeightPercentage ])
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
                if (videoElement) {
                    if (videoElement.paused) {
                        videoElement.play()
                    } else {
                        videoElement.pause()
                    }
                }
            },
            pauseVideo() {
                try {
                    this.$refs.video.pause()
                } catch (e) {
                    
                }
            },
            onVideoSeek() {
                this.updateGraph({force:true, noDataChange: true})
            },
            onPlayVideo(e) {
                this.startRecordingFeature()
                this.saveMousePosition(e)
            },
            onPauseVideo() {
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
                    this.$toasted.show(`Speed x${newRate.toFixed(2)}`).goAway(1000)
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
                // 
                // Save the file
                // 
                let jsonFilePath = this.jsonFilePath
                fs.writeFile(jsonFilePath, JSON.stringify(this.videoLabelData), _=>console.log(`data written to ${jsonFilePath}`))
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
                // reset the video-specific data
                this.videoLabelData = {}
                this.pendingRecords = []
                // for some reason the source doesn't update itself so this manually updates it if needed
                this.$refs.video && (this.$refs.video.src = this.videoFileUrl)
                this.$forceUpdate()
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
                // wait for the video Element to load
                once({
                    isTrue: _=> (this.$refs.video != null) && (this.$refs.video.currentSrc == this.videoFileUrl),
                    then: _=> {
                        this.numberOfChunks = Math.ceil(this.$refs.video.duration * this.graphFrameRate)

                        // load up the labels
                        for (let eachKey in newVideoData) {
                            let labelData = JSON.parse( JSON.stringify( newVideoData[eachKey]))
                            // if its at least kind of formatted correctly
                            if (labelData instanceof Array) {
                                // then convert it to being a LabelRecord
                                newVideoData[eachKey] = new LabelRecord({
                                    numberOfChunks: this.numberOfChunks,
                                    graphFrameRate: this.graphFrameRate,
                                    records: labelData
                                })
                            }
                        }
                        // once all the LabelRecords are created, update the video data
                        this.videoLabelData = newVideoData
                        this.updateGraph({force:true})
                    },
                })
               
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
        --unhovered-panel-amount: 2.8rem;
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
    .wrapper .bubble {
        width: 100%;
        margin-top: 0.8rem;
        padding: 1.5rem;
        border-radius: 1rem;
    }
    .wrapper .settings-bubble {
        background: white;
    }
    .wrapper .video-selector {
        background: var(--teal);
    }
    
    
    * {
        margin: 0;
        padding: 0;
    }
    
    .wrapper .file-picker {
        width: 16rem;
        background-color: whitesmoke;
        border: 0.8rem solid whitesmoke !important;
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
    .wrapper .bottom-bar {
        z-index: 10;
        min-height: fit-content;
        width: calc(100vw - var(--unhovered-panel-amount));
        box-shadow: rgba(0, 0, 0, -0.86) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px, rgba(0, 0, 0, 0.3) 0px 2px 4px -1px;
        max-width: 100vw;
        position: relative;
        background-color: var(--teal);
        /* transition: all 500ms ease-out; */
    }
    .control-bar {
        padding: 1rem 3rem;
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
        margin: 0.8rem 1rem;
    }
    >>>.youtube-link-input input::placeholder {
        color: white;
    }
    >>>.youtube-link-input label {
        border-bottom: white solid;
    }
    .graph-container {
        width: 100%;
    }
</style>
