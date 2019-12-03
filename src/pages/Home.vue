<template>
    <row class=wrapper align-h=left align-v=top>
        <!-- Settings Panel -->
        <settings-panel>
            <!-- Open Video -->
            <template v-slot:header>
                <h5>Video</h5>
                <column class="video-selector bubble" shadow="1">
                    <input class="file-picker" type="file" tabIndex="-1" accept=".mp4,.mov,.avi,.flv,.wmv" @change="chooseFile" placeholder="Choose Video" />
                    <ui-textbox class="youtube-link-input" placeholder="Paste YouTube link" v-model="youtubeLink" />
                </column>
            </template>
            <!-- Labels -->
            <template v-slot:labels>
                <!-- Labels to display -->
                <column v-if="showLabels" class="labels-bubble bubble" shadow="1" align-h="left">
                    <ui-switch v-for="(eachLabel, eachIndex) in labels" :key="eachIndex" v-model="labels[eachIndex]" :label="eachIndex"></ui-switch>
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
import ytdl from 'ytdl-core'

// utils
import { onWheelFlick, binSearch, once } from '@/util/all'
import LabelRecord from '@/util/LabelRecord'

// components/mixins
import HowTo from '@/components/how-to'
import Graph, {graph} from '@/components/graph'
import VideoComponent, {videoComponent} from '@/components/video-component'
import SettingsPanel, {settingsPanel} from "@/components/settings-panel"
import BarMeasure, {barMeasure} from '@/components/bar-measure'
import FeatureMixin, {featureManager} from '@/components/feature-manager'


let   util    = require("util")
const readdir = util.promisify(fs.readdir)
let   dialog  = remote.dialog
let   app     = remote.app

// prevent scrollbars that shouldn't be there
document.body.style.overflow = 'hidden'

// create window listeners
let windowListeners$ = {
     keydown(eventObj) {
        if (this.allowedToCaptureWindowKeypresses) {
            if (eventObj.code == 'ArrowLeft' || eventObj.key == 'a') {
                eventObj.preventDefault()
            } else if (eventObj.code == 'ArrowRight') {
                eventObj.preventDefault()
            } else if (eventObj.code == 'ArrowUp' || eventObj.key == 'w') {
                // eventObj.preventDefault()
                // this.increaseVideoSpeed()
            } else if (eventObj.code == 'ArrowDown' || eventObj.key == 's') {
                // eventObj.preventDefault()
                // this.decreaseVideoSpeed()
            } else if (eventObj.code == 'BracketRight') {
            } else if (eventObj.code == 'BracketLeft') {
                
            }
        }
    }
}

export default {
    name: "main-page",
    components: { VueJsonPretty, HowTo, Graph, BarMeasure, SettingsPanel, VideoComponent },
    mixins: [ FeatureMixin ],
    data: ()=>({
        settings: {},
        // Video data
        videoComponent,
        // other
        allowedToCaptureWindowKeypresses: false,
        youtubeLink: "",
        
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
            if (Object.keys(this.labels).length > 0) {
                return true
            } else {
                return false
            }
        },
    },
    watch: {
        youtubeLink(url) {
            if (typeof url == 'string') {
                if (ytdl.validateURL(url)) {
                    let localPath =  path.resolve(app.getPath("desktop"), "*Name for Downloaded Video*")
                    let videoPath = dialog.showSaveDialog({ defaultPath: localPath })+'.mp4'
                    let writeStream = fs.createWriteStream(videoPath)
                    writeStream.on('close', ()=>{
                        this.$toasted.show(`Finished download`).goAway(2500)
                        setTimeout(() => {
                            videoComponent.currentVideoFilePath = videoPath
                            this.youtubeLink = null
                        }, 0)
                    })
                    this.$toasted.show(`Starting youtube video download`).goAway(2500)
                    ytdl(url, { filter: (format) => format.container === 'mp4' }).pipe(writeStream)
                }
            }
        },
    },
    methods: {
            mouseEnter() {
                this.allowedToCaptureWindowKeypresses = true
                window.allowedToCaptureWindowKeypresses = true
            },
            mouseExit() {
                this.allowedToCaptureWindowKeypresses = false
                window.allowedToCaptureWindowKeypresses = false
            },
        // 
        // other methods
        // 
            chooseFile(e) {
                videoComponent.currentVideoFilePath = e.target.files[0].path
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
    
    .file-picker {
        width: 16rem;
        background-color: whitesmoke;
        border: 0.8rem solid whitesmoke !important;
        border-radius: 100vh;
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
        background: radial-gradient( ellipse at top left, rgba(255, 255, 255, 1) 40%, rgba(229, 229, 229, .9) 100%);
        width: 100vw;
        
        .video-selector {
            background: var(--teal);

            .youtube-link-input {
                margin: 0.8rem 1rem;
            }

            >>> .youtube-link-input {
                input::placeholder {
                    color: white;
                }
                label {
                    border-bottom: white solid;
                }
            }
        }
        
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
