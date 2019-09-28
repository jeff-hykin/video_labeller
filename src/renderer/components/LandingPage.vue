<template>
<div>
  <img v-on:mousemove="updateImageCoordinates" class="image" v-bind:src="image" alt="">
  <div id="wrapper">
    <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
    <div v-for="point in points" >
        <point :x="point.x" :y="point.y"></point>
    </div>
    <main>
        <!-- <input id="myFile" @change="openFolder" type="file" webkitdirectory /> -->
        <input id="myFile" @change="openFile" type="file" />
        <b-button v-if="showNextButton" class="next-button" @click="nextImage" >Next</b-button>
        <b-button v-if="showBackButton" class="back-button" @click="prevImage" >Back</b-button>
    </main>
  </div>
</div>
</template>
<script>
import Point from "./LandingPage/Draggable"
import fs from "fs"
import { remote } from "electron"

let util = require("util")
let path = require("path")
const readdir = util.promisify(fs.readdir)
const stat = util.promisify(fs.stat)

export default {
    name: "landing-page",
    components: { Point },
    data: function() {
        return {
            image: "",
            imagePaths: [],
            currentIndex: null,
            points: []
        }
    },
    computed: {
        showNextButton() {
            return this.currentIndex >= 0 && this.currentIndex+1 < this.numberOfImages
        },
        showBackButton() {
            return this.currentIndex > 0
        }
    },
    methods: {
        updateImageCoordinates(e) {
            let position = { x:e.clientX, y:e.clientY }
        },
        nextImage(e) {
            // if there is a next image
            if (++this.currentIndex < this.numberOfImages) {
                let filepath = Object.keys(this.data)[this.currentIndex]
                this.displayImage(filepath)
            }
        },
        prevImage(e) {
            // if there is a next image
            if (this.currentIndex > 0) {
                let filepath = Object.keys(this.data)[--this.currentIndex]
                this.displayImage(filepath)
            }
        },
        open(link) {
            this.$electron.shell.openExternal(link)
        },
        openFile(e) {
            let filepath = e.target.files[0].path
            let file = fs.readFileSync(filepath).toString()
            this.data = JSON.parse(file)
            
            let keys = Object.keys(this.data)
            // open the initial picture
            this.numberOfImages = keys.length
            this.currentIndex = 0
            this.displayImage(keys[0])
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
            this.imagePaths = imagePaths
        },
        displayImage(filepath) {
            this.image = `data:image/png;base64,${fs.readFileSync(filepath).toString("base64")}`
            let imageData = this.data[filepath]
            // record the image dimensions
            let img = new Image()
            img.onload = ()=>{
                let height = img.height
                let width = img.width
                imageData.height = height
                imageData.width = width
                this.points = imageData.overlays.filter(each => each.type == 'point')
            }
            img.src = this.image
        },
        getPoints() {
            
        }
    },
}

</script>
<style>

.image {
    
}
.next-button {
    position: fixed;
    top: 3rem;
    right: 3rem;
}
.back-button {
    position: fixed;
    top: 3rem;
    left: 3rem;
}

@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Source Sans Pro', sans-serif;
}

#wrapper {
    background: radial-gradient( ellipse at top left, rgba(255, 255, 255, 1) 40%, rgba(229, 229, 229, .9) 100%);
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
}

#logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
}

main {
    display: flex;
    justify-content: space-between;
}
</style>
