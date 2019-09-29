<template>
<column class=wrapper align-h=left align-v=space-between min-height=100vh :min-width='imageWidth'>
    <column align-h=left :max-height='`calc(100vh - ${bottomBarHeight})`' max-width='100vw' overflow=auto position='relative'>
        <img class="image" v-bind:src="imageSource" alt="" style="-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none;"  unselectable="on" onselectstart="return false;">
        <div v-for="point in points" v-bind:key="point.uniqueName" >
            <point :x="point.x" :y="point.y" :uniqueName="point.uniqueName" @moved="pointWasMoved"></point>
        </div>
    </column>
    <row align-h=left :width='imageWidth' :height='bottomBarHeight' shadow=2 background-color=var(--teal)>
        <row align-h=space-between align-v='center' width=100vw padding="2rem 3rem">
            <b-button class="back-button" @click="prevImage" :style="{visibility:showBackButton?'visible':'hidden'}">
                Back
            </b-button>
            <!-- <input @change="openFolder" type="file" webkitdirectory /> -->
            <input class=file-picker type="file" @change="openFile" />
            
            <b-button class="next-button" @click="nextImage" :style="{visibility:showNextButton?'visible':'hidden'}">
                Next
            </b-button>
            
        </row>
    </row>
</column>
</template>
<script>
import Point from "./LandingPage/Draggable"
import fs from "fs"
import { remote } from "electron"
import Column from './LandingPage/column'
import Row from './LandingPage/row'

let util = require("util")
let path = require("path")
const readdir = util.promisify(fs.readdir)
const stat = util.promisify(fs.stat)

export default {
    name: "landing-page",
    components: { Point, Column, Row },
    data: function() {
        return {
            imageSource: "",
            imagePaths: [],
            currentIndex: null,
            points: [],
            currenImageWidth: '100vh',
            bottomBarHeight: '6.5rem',
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
        imageWidth() {
            let value = this.imageData && this.imageData.width && `${this.imageData.width}px`
            return value || '100vw'
        }
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
                // change the indexes to cause a re-compute of imageData (because imageData changed)
                this.currentIndex++
                this.currentIndex--
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
<style scoped>
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Source Sans Pro', sans-serif;
}
/* 
.next-button {
    position: absolute;
    bottom: 3rem;
    right: 3rem;
}
.back-button {
    position: absolute;
    bottom: 3rem;
    left: 3rem;
} */

.wrapper {
    background: radial-gradient( ellipse at top left, rgba(255, 255, 255, 1) 40%, rgba(229, 229, 229, .9) 100%);
    width: 100vw;
}
.file-picker {
    background-color: whitesmoke;
    border: 1rem solid whitesmoke !important;
    border-radius: 100vh;
}
button {
    height: min-content;
}
</style>
