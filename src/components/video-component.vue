<template>
    <video ref=video @pause=onPause @play=onPlay @click=onClick @seeking=onSeek controls>
        <source :src="videoFileUrl" type="video/mp4">
    </video>
</template>

<script>
import path from 'path'

import { featureManager } from "@/components/feature-manager"

export let videoComponent = {}
export default {
    name: "videoComponent",
    beforeCreate() {
        videoComponent = this
        Object.defineProperties(this,{
            paused: {get() {
                try {
                    return this.$refs.video.paused
                } catch (e) {
                    return {}
                }
            }},
            currentTime: {get() {
                try {
                    return this.$refs.video.currentTime
                } catch (e) {
                    return {}
                }
            }},
            exists: {get() {
                return this.$refs.video != null
            }},
        })
    },
    data: ()=>({
        currentVideoFilePath: null,
        windowListeners$: {
            keydown(eventObj) {
                if (window.allowedToCaptureWindowKeypresses) {
                    if (eventObj.code == 'Space') {
                        eventObj.preventDefault()
                        this.togglePlayPause()
                    }
                }
            }
        }
    }),
    watch: {
        // when the path updates, then open up the new video
        currentVideoFilePath(newVal) {
            try {
                this.$refs.video.src = this.videoFileUrl
            } catch(e) {
                
            }
        }
    },
    computed: {
        videoFileUrl() {
            if (this.currentVideoFilePath) {
                return `file://${this.currentVideoFilePath}`
            }
        },
        currentSrc() {
            return this.currentVideoFilePath
        },
    },
    methods: {
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
        togglePlayPause() {
            let videoElement = this.$refs.video
            if (videoElement) {
                if (videoElement.paused) {
                    videoElement.play()
                } else {
                    videoElement.pause()
                }
            }
        }
    },
}
</script>

<style>

</style>