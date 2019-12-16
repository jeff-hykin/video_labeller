<template>
    <row class=wrapper align-h=left align-v=top>
        <!-- Settings Panel -->
        <settings-panel>
            <!-- Labels -->
            <template v-slot:labels>
                <!-- Labels to display -->
                <column v-if="showLabels" class="labels-bubble bubble" shadow="1" align-h="left">
                    <ui-switch v-for="(eachLabel, eachIndex) in labelToggles" :key="eachIndex" v-model="labelToggles[eachIndex]" :label="eachIndex"></ui-switch>
                </column>
            </template>
        </settings-panel>
        <!-- Settings panel gost -->
        <div class=panel-ghost ></div>
        <!-- Main Section -->
        <div class=main-area @mouseenter="mouseEnter" @mouseleave="mouseExit">
            <row class=video-area align-h=left align-v=top>
                <!-- Mouse Height-Measure Bar -->
                <bar-measure />
                <!-- Current Video -->
                <column align-h=left align-v=top overflow=auto height=100% flex-grow=1>
                    <how-to v-if='!videoComponent.currentVideoFilePath' />
                    <video-component />
                </column>
            </row>
            <!-- The bottom bar -->
            <column class=bottom-bar ref=bottomBar align-h=center >
                <!-- Graph -->
                <div v-show='settings.showGraph' class=graph-container >
                    <graph :height='settings.graphHeight' />
                </div>
            </column>
        </div>
    </row>
</template>
<script>
import { remote } from "electron"
import VueJsonPretty from 'vue-json-pretty'
import fs, { write } from "fs"
import path from 'path'

// utils
import { onWheelFlick, binSearch, once } from '@/util/all'

// components/mixins
import HowTo from '@/components/how-to'
import Graph, {graphComponent} from '@/components/graph'
import VideoComponent, {videoComponent} from '@/components/video-component'
import SettingsPanel, {settingsPanel} from "@/components/settings-panel"
import BarMeasure, {barMeasure} from '@/components/bar-measure'
import LabelManagerMixin, {labelManager} from '@/components/label-manager'


let   util    = require("util")
const readdir = util.promisify(fs.readdir)
let   dialog  = remote.dialog
let   app     = remote.app

// prevent scrollbars that shouldn't be there
document.body.style.overflow = 'hidden'

// 
// Controls
// 
let windowListeners$ = {
    mousemove(eventObj) {
        barMeasure.updateMouseValue(eventObj)
    },
    keydown(eventObj) {
        let shiftKeyIsPressed = eventObj.shiftKey
        if (window.allowedToCaptureWindowKeypresses) {
            // [Space]
            if (eventObj.code == 'Space') {
                eventObj.preventDefault()
                videoComponent.scheduleTogglePlayPause()
            // <-
            } else if (eventObj.code == 'ArrowLeft' || eventObj.key == 'a') {
                if (shiftKeyIsPressed) {
                    eventObj.preventDefault()
                    videoComponent.decreaseVideoSpeed()
                } else {
                    eventObj.preventDefault()
                    videoComponent.skipBack()
                }
            // ->
            } else if (eventObj.code == 'ArrowRight' || eventObj.key == 'd') {
                if (shiftKeyIsPressed) {
                    eventObj.preventDefault()
                    videoComponent.increaseVideoSpeed()
                } else {
                    eventObj.preventDefault()
                    videoComponent.skipForward()
                }
            // ↑
            } else if (eventObj.code == 'ArrowUp' || eventObj.key == 'w') {
                eventObj.preventDefault()
                barMeasure.incrementKeyboardValue()
            // ↓
            } else if (eventObj.code == 'ArrowDown' || eventObj.key == 's') {
                eventObj.preventDefault()
                barMeasure.decrementKeyboardValue()
            // [
            } else if (eventObj.code == 'BracketLeft') {
                eventObj.preventDefault()
                videoComponent.decreaseVideoSpeed()
            // ]
            } else if (eventObj.code == 'BracketRight') {
                eventObj.preventDefault()
                videoComponent.increaseVideoSpeed()
            }
        }
    }
}

export default {
    name: "main-page",
    components: { VueJsonPretty, HowTo, Graph, BarMeasure, SettingsPanel, VideoComponent },
    mixins: [ LabelManagerMixin ],
    data: ()=>({
        settings: {},
        // Video data
        videoComponent,
        // other
        allowedToCaptureWindowKeypresses: false,
        windowListeners$
    }),
    mounted() {
        // debugging
        window.main = this 
        // connect the settings panel
        this.settings = settingsPanel.settings
        // connect the video
        this.videoComponent = videoComponent
    },
    computed: {
        showLabels() {
            if (Object.keys(this.labelToggles).length > 0) {
                return true
            } else {
                return false
            }
        },
    },
    methods: {
        mouseEnter() {
            window.allowedToCaptureWindowKeypresses = true
        },
        mouseExit() {
            window.allowedToCaptureWindowKeypresses = false
        },
    },
}

</script>
<style lang='scss' scoped>
    @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');
    @import url('https://fonts.googleapis.com/css?family=Roboto:100,300,400&display=swap');
    
    * {
        margin: 0;
        padding: 0;
    }
    
    video {
        height: -webkit-fill-available;
        width: auto;
    }
    
    .ui-button {
        padding: 0.8em 1.7em;
    }
    
    // variables for child elements
    .wrapper , ::v-deep {
        --bar-measure-width: 5rem;
        --unhovered-panel-amount: 2.8rem;
        --blue: #2196F3;
        --green: #64FFDA;
        --red: #EF5350;
    }
    
    .wrapper {
        background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(227,227,227,1) 100%);
        width: 100vw;
        
        
        .bubble {
            width: 100%;
            margin-top: 0.8rem;
            padding: 1.5rem;
            border-radius: 1rem;
        }
        
        .labels-bubble {
            background: white;
        }
        
        .panel-ghost {
            min-width: var(--unhovered-panel-amount);
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
            
            .video-area {
                height: -webkit-fill-available;
                width: -webkit-fill-available;
            }
            
            .bottom-bar {
                z-index: 10;
                min-height: fit-content;
                width: calc(100vw - var(--unhovered-panel-amount));
                box-shadow: rgba(0, 0, 0, -0.86) 0px 4px 5px 0px, rgba(0, 0, 0, 0.12) 0px 1px 10px 0px, rgba(0, 0, 0, 0.3) 0px 2px 4px -1px;
                max-width: 100vw;
                position: relative;
                background-color: var(--teal);
                /* transition: all 500ms ease-out; */
                
                .graph-container {
                    width: 100%;
                }
            }
        }
    }
    
</style>
