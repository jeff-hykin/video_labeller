<template>
    <column ref=barMeasure class=bar-measure-container shadow=2>
        <div class=bar-cursor :style="`position: absolute; top: ${barCursorPosition}px;`" >
            {{barCursorContent}}
        </div>
    </column>
</template>

<script>
import { settingsPanel } from "@/components/settings-panel"

export let barMeasure

export default {
    name: 'bar-measure',
    beforeCreate() {
        // attach to variable since this component is a singleton
        barMeasure = this
    },
    data: ()=>({
        // bar data
        barCursorHeightPercent: 0,
        barCursorContent: "",
        // recording 
        mouseHeightPercent: 0,
        // listeners
        listenFor$: {
            updateBar({barCursorHeightPercent, barCursorContent}) {
                this.barCursorHeightPercent = barCursorHeightPercent
                this.barCursorContent = barCursorContent
            }
        },
        windowListeners$: {
            // save the location of the mouse
            mousemove(eventObj) {
                let newMouseHeightPercent = 1 - eventObj.pageY / this.$refs.barMeasure.$el.clientHeight
                if (newMouseHeightPercent > 1) {
                    newMouseHeightPercent = 1
                } else if (newMouseHeightPercent < 0) {
                    newMouseHeightPercent = 0
                }
                // if there was a change
                if (newMouseHeightPercent !== this.mouseHeightPercent) {
                    this.mouseHeightPercent = newMouseHeightPercent
                }
            },
        }
    }),
    mounted() {
        // 
        //  connect to settings
        // 
        if (settingsPanel.settings.inputMode == "Mouse") {
                console.log(`inputMode = Mouse`)
        }
        settingsPanel.$watch('settings.inputMode',  (newValue) => {
            console.log(`settings.inputMode is:`,newValue)
        })
    },
    computed: {
        barCursorPosition() {
            try {
                return (1-this.barCursorHeightPercent) * this.$refs.barMeasure.$el.clientHeight
            } catch (e) {
                return 0
            }
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
}
</style>