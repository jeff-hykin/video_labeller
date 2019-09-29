<template>
    <div class="row" :style="{...$attrs, ...justifyContentStyle, ...alignItemsStyle, ...flexWrapStyle, ...shadowStyle }">
        <slot></slot>
    </div>
</template>
<script>
import easyShadow from './easy-shadow'
export default {
    props: {
        'align-v': {
            type: String,
            validator: (value) => ['top', 'bottom', 'center', 'stretch', 'baseline', 'inherit', 'normal'].includes(value)
        },
        'align-h': {
            type: String,
            validator: (value) => ['left', 'right', 'center',  'space-around', 'space-between', 'space-evenly', 'stretch', 'baseline', 'inherit', 'normal'].includes(value)
        },
        'wrap':{
            type: [String, Boolean],
            validator: (value) => [true, false, 'reverse'].includes(value)
        },
        'shadow': {
            type: [Number, String],
        }
    },
    computed: {
        justifyContentStyle() {
            let arrangement = this.$props.alignH || this.$attrs["justify-content"]
            let value = arrangement
            if (arrangement == 'left') {
                value = 'flex-start'
            } else if (arrangement == 'right') {
                value = 'flex-end'
            }
            return (value != null) && { 'justify-content': value }
        },
        alignItemsStyle() {
            let alignment = this.$props.alignV || this.$attrs["align-items"]
            let value = alignment
            if (alignment == 'top') {
                value = 'flex-start'
            } else if (alignment == 'bottom') {
                value = 'flex-end'
            }
            return (value != null) && { 'align-items': value }
        },
        flexWrapStyle() {
            let wrap = this.$props.wrap || this.$attrs["flex-wrap"]
            let value = wrap
            if (wrap == true) {
                value = 'wrap'
            } else if (wrap == 'reverse') {
                value = 'wrap-reverse'
            } else if (wrap == false) {
                value = 'nowrap'
            }
            return (value != null) && { 'flex-wrap': value }
        },
        shadowStyle() {
            let shadowArg = this.$props.shadow || this.$attrs["box-shadow"]
            return shadowArg && easyShadow(shadowArg)
        }
    }
}
</script>
<style scoped>
.row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: nowrap; /* to disable bootstraps global CSS */
    margin: 0; /* to disable bootstraps global CSS */
}
</style>
