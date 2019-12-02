import Vue from "vue"

import { barMeasure } from '@/components/bar-measure'

export default {
    data() {
        return {
            featureManager: {
                // 
                // data
                // 
                featureValue: 0,
                mouseHeight: 0,
                // 
                // methods
                // 
                mouseMove: (eventObj) => {
                    // if in mouse mode
                    if (this.settings.inputMode == "Mouse") {
                        // then update the mouse height value as a percentage
                        this.featureManager.mouseHeight = 1 - eventObj.offsetY / eventObj.target.clientHeight 
                        this.featureManager.featureValue = this.featureManager.mouseHeight
                    }
                },
            },
        }
    },
    watch: {
        // whenever the feature value is changed, tell the bar to update
        'featureManager.featureValue': function (newVal) {
            // barMeasure.tell$({say:'updateBar', from:'featureManager', args:[{
            //     barCursorHeightPercent: this.featureManager.featureValue,
            //     barCursorContent: `${Math.round(this.featureManager.featureValue*100)}%`
            // }]})
        },
        'settings.inputMode': function (newVal) {
            console.log(`newVal is:`,newVal)
        }
    },
    mounted() {
        if (this.settings.inputMode == "Mouse") {
                console.log(`inputMode = Mouse`)
        }
    },
}
