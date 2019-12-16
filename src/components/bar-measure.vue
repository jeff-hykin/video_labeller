<template>
    <column ref=barMeasure class=bar-measure-container shadow=2>
        <div :class='["bar-cursor",{Keyboard:settings.inputMode=="Keyboard", Mouse:settings.inputMode=="Mouse"}]' :style="`position: absolute; top: ${barCursorPosition()}px;`" >
            {{barCursorContent()}}
        </div>
    </column>
</template>

<script>
import { settingsPanel } from "@/components/settings-panel"


export let barMeasure = {}
export default {
    name: 'barMeasure',
    beforeCreate() {
        // attach to variable since this component is a singleton
        barMeasure = this
    },
    data: ()=>({
        // recording 
        mouseHeightPercent: 0,
        arrowValue: 0,
        // misc
        settings: {},
        windowListeners$: {
            resize() {
                this.$forceUpdate()
            }
        }
    }),
    watch: {
        arrowValue() {
            this.$emit("newCurrentValue", this.currentValue())
        },
        mouseHeightPercent() {
            this.$emit("newCurrentValue", this.currentValue())
        }
    },
    mounted() {
        //
        //  connect to settings
        //
        this.settings = settingsPanel.settings
        settingsPanel.$watch('settings.inputMode',  (newValue) => {
            // reset the arrow value
            if (settingsPanel.settings.inputMode == "Keyboard") {
                this.arrowValue = 0
            }
        })
        
        // the DOM changes a bit after the first load
        // this is needed for barCursorPosition to get the right clientHeight
        setTimeout(() => { this.$forceUpdate() }, 0)
    },
    methods: {
        updateMouseValue(eventObj) {
            if (settingsPanel.settings.inputMode == "Mouse") {
                let barHeight = this.$refs.barMeasure.$el.clientHeight
                let mouseYPosition = eventObj.pageY
                
                let realNewMouseHeightPercent = (1 - eventObj.pageY / this.$refs.barMeasure.$el.clientHeight)
                let newMouseHeightPercent = realNewMouseHeightPercent
                // exaggerate the movement
                // move down
                newMouseHeightPercent -= 0.5
                // expand
                newMouseHeightPercent *= settingsPanel.settings.mouseExaggeration
                // move back up
                newMouseHeightPercent += 0.5
                
                // keep it inside  0 >= newMouseHeightPercent >= 1
                if (newMouseHeightPercent > 1) {
                    newMouseHeightPercent = 1
                } else if (newMouseHeightPercent < 0) {
                    newMouseHeightPercent = 0
                }
                // if there was a change
                if (newMouseHeightPercent !== this.mouseHeightPercent) {
                    this.mouseHeightPercent = newMouseHeightPercent
                }
            }
        },
        decrementKeyboardValue() {
            if (settingsPanel.settings.inputMode == "Keyboard") {
                this.arrowValue -= 1
            }
        },
        incrementKeyboardValue() {
            if (settingsPanel.settings.inputMode == "Keyboard") {
                this.arrowValue += 1
            }
        },
        // the external-facing value of the current label
        currentValue() {
            if (settingsPanel.settings.inputMode == "Mouse") {
                return this.mouseHeightPercent
            } else if (settingsPanel.settings.inputMode == "Keyboard") {
                // the sigmoid value of the arrow value
                // https://en.wikipedia.org/wiki/Sigmoid_function
                return 1/(1 + Math.E**(-this.arrowValue))
            } else {
                console.error("settingsPanel.settings.inputMode not recognized 9048540843")
            }
        },
        // internal property for computing position
        // internal property for computing content
        barCursorContent() {
            if (settingsPanel.settings.inputMode == "Mouse") {
                return `${(this.mouseHeightPercent * 100).toFixed(0)}%`
            } else if (settingsPanel.settings.inputMode == "Keyboard") {
                return `${this.arrowValue}`
            } else {
                console.error("settingsPanel.settings.inputMode not recognized 9048540843")
            }
        },
        // this has to be a method because it uses external data (clientHeight)
        barCursorPosition() {
            let output = 0
            let height
            try {
                output = (1-this.currentValue()) * this.$refs.barMeasure.$el.clientHeight
            } catch (e) {
                output = 0
            }
            return output
        }
    }
}
</script>

<style lang='scss' scoped>
.bar-measure-container {
    min-width: 3rem;
    height: 100%;
    background: linear-gradient(0deg, rgba(255,104,100,1) 0%, rgba(73,227,203,1) 52%, rgba(0,114,255,1) 100%);
    
    .bar-cursor {
        z-index: 1;
        width: fit-content;
        height: fit-content;
        padding: 0.5rem 1rem 0.5rem calc(0.5rem + var(--unhovered-panel-amount));
        background: var(--red);
        border: white 4px solid;
        border-radius: 100vh;
        box-sizing: content-box;
        left: 0;
        color: white;
        transform: translateY(-50%);
    }
    .bar-cursor.Mouse {
        transition: top 20ms linear;
    }
    .bar-cursor.Keyboard {
        transition: all 150ms ease;
    }
}
</style>