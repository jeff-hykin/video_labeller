<template>
<column class=wrapper align-h=left align-v=space-between min-height=100vh>
    <column align-h=left align-v=top :max-height='`calc(100vh - ${bottomBarHeight()})`' max-width='100vw' overflow=auto position='relative'>
        <!-- Current Video -->
        <video v-if=this.currentVideoFilePath  controls>
            <source :src="this.currentVideoFilePath" type="video/mp4">
        </video>
    </column>
    <!-- The bottom bar -->
    <row ref=bottomBar width=100vw max-width=100vw shadow=2 position=relative background-color=var(--teal) padding='2rem 3rem' padding-top='1rem'>
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
            <row align-h=space-between width=100% min-width=min-content>
                <b-button class="back-button" @click="prevImage" :style="{visibility:showBackButton?'visible':'hidden'}">
                    Back
                </b-button>
                <!-- <input @change="openFolder" type="file" webkitdirectory /> -->
                <row padding='0 1rem'>
                    <input class=file-picker type="file" @change="chooseFile" />
                    <!-- <b-button variant="primary" class="save-button" @click="saveData" :style="{marginLeft: '2rem', visibility:data!=null?'visible':'hidden'}">
                        Save
                    </b-button> -->
                </row>
                
                <b-button class="next-button" @click="nextImage" :style="{visibility:showNextButton?'visible':'hidden'}">
                    Next
                </b-button>
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
</column>
</template>
<script>
import fs from "fs"
import { remote } from "electron"
import VueJsonPretty from 'vue-json-pretty'
import path from 'path'

import Graph from "./LandingPage/graph"
import Point from "./LandingPage/Draggable"
import Column from './LandingPage/column'
import Row from './LandingPage/row'

let util = require("util")
const readdir = util.promisify(fs.readdir)
const stat = util.promisify(fs.stat)

export default {
    name: "main-page",
    components: { Point, Column, Row, VueJsonPretty, Graph },
    data: ()=>({
        currentVideoFilePath: "/Users/jeffhykin/Desktop/glitch_multicursor.mov",
        currentFeatureName: "",
        currentFeatureValue: 0,
        recordedFeatures:[],
    }),
    mounted(){
        window.addEventListener('keydown', (e)=>{
            if (e.code == 'ArrowLeft') {
                e.preventDefault()
                // TODO
            } else if (e.code == 'ArrowRight') {
                e.preventDefault()
                // TODO
            }
        })
    },
    computed: {
    },
    watch: {
    },
    methods: {
        // Main Video Methods
        startRecordingFeature() {
            // TODO
        },
        stopRecoringFeature() {
            // TODO
        },
        onPlayVideo() {
            this.startRecordingFeature()
            // TODO: start a set timeout
        },
        onPauseVideo() {
            this.stopRecoringFeature()
            // TODO: cancel the setTimeout that is recording values
        },
        onVideoEnd() {
            this.stopRecoringFeature()
            // TODO: save the features an show a pop up
        },
        // helpers
        bottomBarHeight() {
            let output = '0'
            if (this.$refs.bottomBar) {
                output = `${this.$refs.bottomBar.$el.clientHeight}px`
            } else {
                setTimeout(_=>this.$forceUpdate(),0)
            }
            return output
        },
        saveData(filePath) {
            fs.writeFile(filePath, JSON.stringify(this.recordedFeatures), _=>console.log(`data written to ${filePath}`))
        },
        open(link) {
            this.$electron.shell.openExternal(link)
        },
        chooseFile(e) {
            this.currentVideoFilePath = e.target.files[0].path
            // let file = fs.readFileSync(this.jsonFilePath).toString()
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


* {
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Source Sans Pro', sans-serif;
}

.wrapper {
    background: radial-gradient( ellipse at top left, rgba(255, 255, 255, 1) 40%, rgba(229, 229, 229, .9) 100%);
    width: 100vw;
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
button {
    height: min-content;
}
</style>
