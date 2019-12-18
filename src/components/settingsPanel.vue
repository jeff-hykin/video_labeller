<template>
    <column align-h="left" align-v="top" :class="['panel', { init }]" shadow="2">
        <div>
            <!-- Video Opener -->
            <h5>Video</h5>
            <column class="video-selector bubble" shadow="1">
                <ui-fileupload
                        name="video-file"
                        label="Open Video"
                        @change="chooseFile"
                    >
                    Open A Video
                    <ui-icon slot="icon">videocam</ui-icon>
                </ui-fileupload>
                <ui-textbox class="youtube-link-input" placeholder="Paste YouTube link" v-model="youtubeLink" />
            </column>
            
            <!-- Save button -->
            <br/><br/><br/>
            <row width=100%>
                <ui-button @click="saveData" class="save-button" color="primary" raised :style="{ marginLeft: '0rem' }">
                    Save All Changes
                </ui-button>
            </row>
            
            <!-- Labels -->
            <br/><br/><br/>
            <h5>Labels</h5>
            <row align-h="space-between" width="100%" padding="1rem 0rem">
                <ui-textbox label="Active Label" v-model="settings.currentLabelName" />
            </row>
            <slot name="labels" />
            
            <!-- Graph Settings -->
            <br /><br /><br /><br />
            <h5>Graph Settings</h5>
            <column class="settings-bubble bubble" shadow="1" align-h="left">
                <ui-switch v-model="settings.showGraph">
                    Show Graph
                </ui-switch>
                <br />
                <ui-textbox label="Graph Height" v-model="settings.graphHeight" />
                <br />
                <ui-textbox label="Number of seconds graph should show" v-model="settings.graphRange" />
                <!-- <br />
                <br />
                <ui-textbox label="Graph frame rate (fps)" v-model="settings.graphFrameRate" /> -->
            </column>
            
            <!-- General Settings -->
            <br /><br />
            <h5>General Settings</h5>
            <column class="settings-bubble bubble" shadow="1" align-h="left">
                <ui-radio-group name="Input Mode" :options="modeOptions" v-model="settings.inputMode">
                    Input Mode
                </ui-radio-group>
                <br />
                <ui-textbox label="Video Speed" v-model="settings.videoSpeed" />
                <br />
                <ui-textbox label="Video Speed Multiplier" v-model="settings.videoSpeedMultiplier" />
                <br />
                <ui-textbox label="Skip Back Amount (Seconds)" v-model="settings.skipBackAmount" />
                <br />
                <ui-textbox label="Mouse Exaggeration" v-model="settings.mouseExaggeration" />
            </column>
            
            
            <!-- <ui-textbox style="margin-top: 1.5rem" :multi-line="true" label="Videos" v-model="videoList" /> -->
        </div>
    </column>
</template>

<script>
import { videoComponent } from '@/components/videoWrapper'
import { labelManager } from './labelManager'
import ytdl from 'ytdl-core'
import fs, { write } from "fs"
import path from 'path'
import { remote } from "electron"

let   util    = require("util")
const readdir = util.promisify(fs.readdir)
let   dialog  = remote.dialog
let   app     = remote.app

let localSettingsLocation = "videoLabelerSettings"

export let settingsPanelComponent = {}
export default {
    name: "settingsPanel",
    beforeCreate() {
        settingsPanelComponent = this
    },
    data: () => ({
        youtubeLink:"",
        settings: {
            currentLabelName: "ExampleLabel1",
            inputMode: "Mouse",
            videoSpeed: 1,
            mouseExaggeration: 3,
            showGraph: false,
            videoSpeedMultiplier: 1.4,
            skipBackAmount: 5, // seconds
            graphRange: 10, // seconds
            graphHeight: 250, // pixels
            graphFrameRate: 30, // frames per second
        },
        modeOptions: [
            {
                label: "Keyboard",
                value: "Keyboard",
            },
            {
                label: "Mouse",
                value: "Mouse",
            },
        ],
        init: true,
    }),
    mounted() {
        // have an initial value that gets turned to false (for css classes)
        setTimeout(_=>this.init = false, 1300)
        this.loadSettings()
    },
    watch: {
        settings: {
            deep: true,
            handler(val) {
                this.saveSettings()
            },
        },
        async youtubeLink(url) {
            if (typeof url == 'string') {
                if (ytdl.validateURL(url)) {
                    let localPath =  path.resolve(app.getPath("desktop"), "*Name for Downloaded Video*")
                    let answer = await dialog.showSaveDialog({ defaultPath: localPath })
                    if (answer && answer.filePath) {
                        var videoPath = answer.filePath+'.mp4'
                    }
                    let writeStream = fs.createWriteStream(videoPath)
                    writeStream.on('error', error=>console.error('there was an error with downloading the video: ', error))
                    writeStream.on('close', ()=>{
                        this.$toasted.show(`Finished download`).goAway(2500)
                        setTimeout(() => {
                            this.$emit("say:openVideo", {videoPath})
                            this.youtubeLink = null
                        }, 0)
                    })
                    this.$toasted.show(`Starting youtube video download`).goAway(2500)
                    ytdl(url, { 
                        filter: (format) => format.container === 'mp4'
                    }).pipe(writeStream)
                }
            }
        },
    },
    methods: {
        saveSettings() {
            window.localStorage.setItem(localSettingsLocation, JSON.stringify(this.settings))
        },
        loadSettings() {
            let settings = window.localStorage.getItem(localSettingsLocation)
            if (typeof settings == "string") {
                let savedSettings = JSON.parse(settings)
                this.settings = { ...this.settings, ...savedSettings }
            }
        },
        saveData() {
            this.$emit("say:saveDataToFile")
        },
        chooseFile(e) {
            let pendingLoadPath = e[0].path
            
            // ask labelManager if the data is saved 
            if (labelManager.dataIsSaved) {
                // if the data is saved, then no further action needed, load new video
                this.$emit("say:openVideo", {videoPath:pendingLoadPath})
            // if the data hasn't been saved, ask the user if they want to save it
            } else {
                let timeout = 9500
                this.$toasted.show(`Data not saved`, {
                    action:[
                        {
                            text : 'Save Now',
                            onClick : (eventData, toastObject) => {
                                // make the notification dissapear on click
                                toastObject.goAway(0)
                                // once saved, then load the pending path
                                labelManager.$once("finished:saveDataToFile", (eventData) => {
                                    // if related to the say:saveDataToFile (not somehow a different finished:saveDataToFile event)
                                    // (this could occur if there was)
                                    if (eventData.pendingLoadPath == pendingLoadPath) {
                                        // then load the pending video
                                        this.$emit("say:openVideo", {videoPath:pendingLoadPath})
                                    }
                                })
                                // tell the labelManager that data needs to be saved
                                this.$emit("say:saveDataToFile")
                            },
                        },
                        {
                            text : 'Open Anyways',
                            onClick : (eventData, toastObject) => {
                                toastObject.goAway(0)
                                this.$emit("say:openVideo", {videoPath:pendingLoadPath})
                            },
                        },
                    ]
                })
            }
            
        },
    },
}
</script>

<style lang="scss" scoped>
.panel {
    position: fixed;
    min-width: 22rem;
    transform: translateX(calc(-100% + var(--unhovered-panel-amount) + 3px));
    transition: all 500ms ease-out;
    background-color: whitesmoke;
    height: 100vh;
    overflow: auto;
    left: 0;
    z-index: 11;
    padding: 2rem 3rem;
    padding-right: calc(var(--unhovered-panel-amount) + 1rem);

    .bubble {
        width: 100%;
        margin-top: 0.8rem;
        padding: 1.5rem;
        border-radius: 1rem;
    }
    
    .video-selector {
        background: var(--teal);
        
        .file-picker {
            width: 16rem;
            background-color: whitesmoke;
            border: 0.8rem solid whitesmoke !important;
            border-radius: 100vh;
        }

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

    .labels-bubble {
        background: white;
    }

    .settings-bubble {
        background: white;
    }
}
.panel.init {
    transform: translateX(0);
}
.panel:hover {
    transform: translateX(0);
    padding: 2rem 2rem;
}
</style>
