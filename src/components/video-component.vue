<template>
    <video ref=video @pause=onPause @play=onPlay @click=onClick @seeking=onSeek @ended=onEnded controls>
        <source :src="videoFileUrl" type="video/mp4">
    </video>
</template>

<script>
import path from 'path'

import { labelManager } from "@/components/label-manager"
import { settingsPanel } from './settings-panel.vue'


// 
// summary
// 
    // this component is a wrapper around the video element
    // internal responsibilities:
    //  - diplay the video element and handle it's controls
    //  - listen to when the settings panel wants to open a video with `say:openVideo`
    //  - abstract the play/pause/toggle video behavior so it works as expected
    // external responsibilities
    //  - make sure `currentVideoFilePath` and `videoFileUrl` are always accurate for others
    //  - allow others to change `currentVideoFilePath` to change the video
    //  - allow others to call:
    //      - paused
    //      - currentTime
    //      - exists
    //      - schedulePlay()
    //      - schedulePause()
    //      - scheduleTogglePlayPause()
    //      - decreaseVideoSpeed()
    //      - increaseVideoSpeed()
    //      - skipBack()
    //      - skipForward()
    //  - allow others to listen to:
    //      - pause
    //      - play
    //      - seek
    //      - click
    //      - ended
    // 
    // are there any complicated parts of this component?
    //     yes, the play/pause/toggle is somewhat complicated (see comment block way below)
    //     however everything else is pretty simple and straightforward

export let videoComponent = {}
export default {
    name: "videoComponent",
    beforeCreate() {
        videoComponent = this
        
        // 
        // create getters
        // 
        Object.defineProperties(this,{
            paused: {get() {
                return this.mostRecentlyScheduledIsPause
            }},
            currentTime: {get() {
                return this.$refs.video && this.$refs.video.currentTime
            }},
            exists: {get() {
                return this.$refs.video != null
            }},
        })
    },
    data: ()=>({
        currentVideoFilePath: null,
        mostRecentlyScheduledIsPause: true,
        pendingPlay: null,
    }),
    mounted() {
        // whenever settings wants to open a video
        settingsPanel.$on("say:openVideo", ({ videoPath })=> {
            // just change the path (when the path changes, it changes the video element)
            this.currentVideoFilePath = videoPath
        })
    },
    watch: {
        // when the path updates, then open up the new video
        currentVideoFilePath(newVal) {
            if (this.exists) {
                this.$refs.video.src = this.videoFileUrl
            }
        }
    },
    computed: {
        videoFileUrl() {
            return this.currentVideoFilePath && `file://${this.currentVideoFilePath}`
        },
    },
    methods: {
        
        // 
        // skip
        // 
        
        skip(skipBackOrForwards){
            if (this.exists) {
                // change the time to be the correct final time
                let newCurrentTime = this.currentTime
                if (skipBackOrForwards == "skipBack") {
                    newCurrentTime -= settingsPanel.settings.skipBackAmount
                } else if (skipBackOrForwards == "skipForward") {
                    newCurrentTime += settingsPanel.settings.skipBackAmount
                }
                this.$refs.video.currentTime = newCurrentTime
                // tell the labelManager that we just teleported to a specific time
                this.$emit(`say:${skipBackOrForwards}`, { currentTime: newCurrentTime })
            }
        },
        skipBack() {
            this.skip("skipBack")
        },
        skipForward() {
            this.skip("skipForward")
        },
        
        // 
        // video speed
        // 
        
        changeVideoSpeed(multiplier) {
            if (this.exists) {
                // increase the speed by the videoSpeedMultiplier
                let currentRate = this.$refs.video.playbackRate
                let newRate = currentRate * multiplier
                // if the rate is close to 1, then round it to 1 to prevent weird precision errors
                if (newRate+0.05 > 1 && newRate-0.05 < 1) {
                    newRate = 1
                }
                this.$refs.video.playbackRate = newRate
                this.$toasted.show(`Speed x${newRate.toFixed(2)}`).goAway(1000)
            }
        },
        increaseVideoSpeed() {
            this.changeVideoSpeed(settingsPanel.settings.videoSpeedMultiplier)
        },
        decreaseVideoSpeed() {
            this.changeVideoSpeed(1/settingsPanel.settings.videoSpeedMultiplier)
        },
        
        // 
        // play/pause handler
        // 
        
        // why do the below functions exist?
        //     because the default play/pause of the video don't work in the way you might expect
        //     for example:
        //          videoElement.play()
        //          videoElement.pause()
        //     will almost cetainly cause an error
        //     and:
        //          videoElement.pause()
        //          videoElement.play()
        //          console.log(videoElement.paused) // will output true
        // 
        // what do the below functions do?
        //     they give you the expected behavior of play, pause, and toggle
        //     by wrapping them inside of schedulePlay, schedulePause, and scheduleTogglePlayPause
        //     they also affect the this.paused so that it behaves as expected
        // 
        // why is the normal behavior different from expected?
        //     The builtin play() function is async, meaning, you can't play the video
        //     you can only schedule for the video to be played
        //     however the builtin pause() function is sync
        //     this means you can schedule for the video to be played,
        //     and then immediately tell it to pause before it gets a chance to start playing
        //     which results in an error
        // 
        // how do the following functions fix the situation?
        //     they fix it by keeping track of when the play action has been scheduled
        //     and then if it is scheduled, it waits on it before taking another play/pause action
        //     and the this.paused always returns what was most recently scheduled (either play or pause)
        //     even if it hasn't had time to take effect

        schedulePlay() {
            this.mostRecentlyScheduledIsPause = false
            // if no play has been scheduled, then schedule one
            if (!(this.pendingPlay instanceof Promise)) {
                this.pendingPlay = this.$refs.video.play()
                // as soon as pending play is resolved, remove it
                this.pendingPlay.then(eventObj=>this.pendingPlay = null)
            }
        },
        schedulePause() {
            this.mostRecentlyScheduledIsPause = true
            // await play if needed before pausing
            if (this.pendingPlay instanceof Promise) {
                this.pendingPlay.then(()=>{
                    this.$refs.video.pause()
                })
            } else {
                this.$refs.video.pause()
            }
        },
        scheduleTogglePlayPause() {
            // await play and pause before toggle
            if (this.mostRecentlyScheduledIsPause) {
                this.schedulePlay()
            } else {
                this.schedulePause()
            }
        },
        
        // 
        // callbacks
        // 
        
        onPause(eventObj) {
            this.$emit("pause", eventObj)
        },
        onPlay(eventObj) {
            this.$emit("play", eventObj)
        },
        onSeek(eventObj) {
            this.$emit("seek", eventObj)
        },
        onClick(eventObj) {
            this.$emit("click", eventObj)
        },
        onEnded(eventObj) {
            this.$emit("ended", eventObj)
        },
    },
}
</script>

<style>

</style>