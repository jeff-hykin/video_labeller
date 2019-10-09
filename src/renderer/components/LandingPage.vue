<template>
<column class=wrapper align-h=left align-v=space-between min-height=100vh>
    <column align-h=left align-v=top :max-height='`calc(100vh - ${bottomBarHeight()})`' max-width='100vw' overflow=auto position='relative'>
        <img class="image" v-bind:src="imageSource" alt="" style="-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none;"  unselectable="on" onselectstart="return false;" >
        <div v-if='showPoints' v-for="point in points" v-bind:key="point.uniqueName" >
            <point :x="point.x" :y="point.y" :uniqueName="point.uniqueName" @moved="pointWasMoved"></point>
        </div>
        <column v-if="jsonFilePath.length == 0" align-h=left align-v='top' padding-top=2rem padding-left=2rem>
            <h5>How do I use this?</h5>
            <br>
            <p>
                If you have some image files, for example<br>
                <pre>image1.png</pre>
                <pre>image2.png</pre>
                <br>
                And you have some points (ex: facial landmarks) for those items<br>
                <pre>image1: point1(x=1, y=2), point2(x=2, y=3), etc</pre>
                <pre>image2: point1(x=1, y=2), point2(x=2, y=3), etc</pre>
                (units are in pixels)
                <br>
                <br>
                Place all of that info in a json file, in this format<br>
                </p>
                <p>
                <pre>
{
    "image1.png" : {
        "overlays": [
            {
                "type": "point",
                "uniqueName": "point1",
                "x": 1,
                "y": 2,
            },
            {
                "type": "point",
                "uniqueName": "point2",
                "x": 2,
                "y": 3
            }
        ]
    },
    "image2.png": {
        "overlays": [
            {
                "type": "point",
                "uniqueName": "point1",
                "x": 1,
                "y": 2,
            },
            {
                "type": "point",
                "uniqueName": "point2",
                "x": 2,
                "y": 3
            }
        ]
    }
}
                </pre></p>
                <p>
                    You can then open that json file (using "choose file" below)<br>
                    And you will be able to cycle through images and edit their points
                </p>
                <br>
                <br>
                <h5>Where is the information saved?</h5>
                <p>
                    Right now the edited info is saved in
                    <pre>*name-of-your-json-file*.updated.json</pre>
                    <br>
                    <br>
                    <br>
                </p>
                    <div style="height:"></div>
        </column>
    </column>
    <!-- The bottom bar -->
    <row ref=bottomBar width=100vw max-width=100vw shadow=2 position=relative background-color=var(--teal) padding='2rem 3rem' padding-top='1rem'>
        <column width=100%>
            <div class="popover-trigger options" style="position:absolute; top: 0; left: 0; font-size: 14pt">
                <p style='padding: 0.7rem; border: none; text-decoration: underline; color: white;'>Options</p>
                <ui-popover open-on="mouseenter">
                    <column padding='2rem' height=10rem>
                        <ui-switch v-model="showPoints">Show X's</ui-switch>
                    </column>
                </ui-popover>
            </div>
            <row padding='0.5rem' position=relative top='-0.5rem'>
                <pre v-if="this.currentImagePath != null">{{this.currentImagePath}}</pre>
            </row>
            <row align-h=space-between width=100% min-width=min-content>
                <b-button class="back-button" @click="prevImage" :style="{visibility:showBackButton?'visible':'hidden'}">
                    Back
                </b-button>
                <!-- <input @change="openFolder" type="file" webkitdirectory /> -->
                <row padding='0 1rem'>
                    <input class=file-picker type="file" @change="openFile" />
                    <b-button variant="primary" class="save-button" @click="saveData" :style="{marginLeft: '2rem', visibility:data!=null?'visible':'hidden'}">
                        Save
                    </b-button>
                </row>
                
                <b-button class="next-button" @click="nextImage" :style="{visibility:showNextButton?'visible':'hidden'}">
                    Next
                </b-button>
            </row>
        </column>
    </row>
</column>
</template>
<script>
import Point from "./LandingPage/Draggable"
import fs from "fs"
import { remote } from "electron"
import Column from './LandingPage/column'
import Row from './LandingPage/row'
import path from 'path'

let util = require("util")
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
            jsonFilePath: '',
            currenImageWidth: '100vh',
            data: null,
            triggerUpdate: 0,
            showPoints: true,
        }
    },
    mounted(){
        window.addEventListener('keydown', (e)=>{
            if (e.code == 'ArrowLeft') {
                e.preventDefault()
                this.prevImage()
            } else if (e.code == 'ArrowRight') {
                e.preventDefault()
                this.nextImage()
            }
        })
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
            this.saveData()
            let imagePath = this.currentImagePath
            // if its not an absolute path, then assume it is a relative path from the json file
            if (!path.isAbsolute(imagePath)) {
                imagePath = path.join( path.dirname(this.jsonFilePath), imagePath)
            }
            // open the new image
            let failed = false
            this.points = []
            try {
                console.log(`imagePath is:`,imagePath)
                this.imageSource = `data:image/png;base64,${fs.readFileSync(imagePath).toString("base64")}`
            } catch (e) {
                alert(`Unable to load the image at '${imagePath}'\nDoes the image exist and is in png/jpeg format?`)
                failed = true
            }
            if (!failed) {
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
        }
    },
    methods: {
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
            // if not the first load
            if (this.currentIndex != null) {
                // save the new point values
                let lengthOfJsonExtension = 5 // '.json'
                let baseJsonFilePath = this.jsonFilePath.substring(0, this.jsonFilePath.length - lengthOfJsonExtension)
                fs.writeFile(baseJsonFilePath+'.updated.json', JSON.stringify(this.data), _=>console.log('data written'))
            }
        },
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
            this.jsonFilePath = e.target.files[0].path
            let file = fs.readFileSync(this.jsonFilePath).toString()
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
.options {
    font-family: Roboto;
    font-weight: 100;
    color: #f5f5f5;
}
button {
    height: min-content;
}
</style>
