export default {
    data: ()=>({
        windowListeners$: {}
    }),
    mounted() {
        // add all the listeners
        for (let each in this.windowListeners$) {
            // bind all of them to the component
            this.windowListeners$[each] = this.windowListeners$[each].bind(this)
            window.addEventListener(each, this.windowListeners$[each])
        }
    },
    beforeDestroy() {
        // remove all the listeners
        for (let each in this.windowListeners$) {
            window.addEventListener(each, this.windowListeners$[each])
        }
    }
}