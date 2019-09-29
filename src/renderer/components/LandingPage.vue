<template>
<v-box align-items="left">
  <img class="image" v-bind:src="imageSource" alt=""  style="-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none;"  unselectable="on" onselectstart="return false;">
  <div id="wrapper" :style="{height: `calc(100vh - ${imageData.height || 0}px)`}">
    <img id="logo" src="~@/assets/logo.png" alt="electron-vue">
    <div v-for="point in points" v-bind:key="point.uniqueName" >
        <point :x="point.x" :y="point.y" :uniqueName="point.uniqueName" @moved="pointWasMoved"></point>
    </div>
    <main>
        <!-- <input id="myFile" @change="openFolder" type="file" webkitdirectory /> -->
        <input id="myFile" @change="openFile" type="file" />
        <b-button v-if="showNextButton" class="next-button" @click="nextImage" >Next</b-button>
        <b-button v-if="showBackButton" class="back-button" @click="prevImage" >Back</b-button>
    </main>
  </div>
</v-box>
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
            imageSource: "",
            imagePaths: [],
            currentIndex: null,
            points: []
        }
    },
    computed: {
        showNextButton() {
            return this.currentIndex >= 0 && this.currentIndex+1 < this.imagePaths.length
        },
        showBackButton() {
            return this.currentIndex > 0
        },
        currentImagePath() {
            return this.imagePaths[this.currentIndex]
        },
        imageData() {
            if (this.currentImagePath && this.data[this.currentImagePath]) {
                return this.data[this.currentImagePath]
            } else {
                return {}
            }
        },
    },
    watch: {
        // whenever the index changes, load the new image
        currentIndex(newValue, oldValue) {
            // open the new image
            this.imageSource = `data:image/png;base64,${fs.readFileSync(this.currentImagePath).toString("base64")}`
            let img = new Image()
            img.onload = ()=>{
                // get the image dimensions
                this.imageData.height = img.height
                this.imageData.width = img.width
                
                // extract all the points after the dimensions are retrieved
                this.points = this.imageData.overlays.filter(each => each.type == 'point')
                
                // give unique names to all the points that don't have unique names
                for (let index in this.points) {
                    if (this.points[index].uniqueName == null) {
                        this.points[index].uniqueName = Math.random()
                    }
                }
            }
            img.src = this.imageSource
        }
    },
    methods: {
        nextImage(e) {
            // if there is a next image
            if (this.currentIndex+1 < this.imagePaths.length) {
                // then go to it
                ++this.currentIndex
            }
        },
        prevImage(e) {
            // if there is a previous image
            if (this.currentIndex > 0) {
                // then go to it
                --this.currentIndex
            }
        },
        open(link) {
            this.$electron.shell.openExternal(link)
        },
        openFile(e) {
            let filepath = e.target.files[0].path
            let file = fs.readFileSync(filepath).toString()
            this.data = JSON.parse(file)
            this.imagePaths = Object.keys(this.data)
            // set (or reset) the index so that the image is loaded
            this.currentIndex = 0
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
        pointWasMoved({x, y, uniqueName}) {
            // update the value of the point
            let point = this.points.filter(each => each.uniqueName == uniqueName)[0]
            point.x = x
            point.y = y
        }
    },
}

</script>
<style>

.image {
    
}
.next-button {
    position: fixed;
    bottom: 3rem;
    right: 3rem;
}
.back-button {
    position: fixed;
    bottom: 3rem;
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
