<template>
    <div class="column" :style="{...$attrs, ...justifyContentStyle, ...alignItemsStyle, ...flexWrapStyle, ...shadowStyle }">
        <slot></slot>
    </div>
</template>
<script>
import {component} from './common'

export default {
    props: {
        ...component.props,
        'align-h': {
            type: String,
            validator: (value) => ['left', 'right', 'center', 'stretch', 'baseline', 'inherit', 'normal'].includes(value)
        },
        'align-v': {
            type: String,
            validator: (value) => ['top', 'bottom', 'center',  'space-around', 'space-between', 'space-evenly', 'stretch', 'baseline', 'inherit', 'normal'].includes(value)
        },
    },
    computed: {
        ...component.computed,
        justifyContentStyle() {
            let arrangement = this.$props.alignV || this.$attrs["justify-content"]
            let value = arrangement
            if (arrangement == 'top') {
                value = 'flex-start'
            } else if (arrangement == 'bottom') {
                value = 'flex-end'
            }
            return (value != null) && { 'justify-content': value }
        },
        alignItemsStyle() {
            let alignment = this.$props.alignH || this.$attrs["align-items"]
            let value = alignment
            if (alignment == 'left') {
                value = 'flex-start'
            } else if (alignment == 'right') {
                value = 'flex-end'
            }
            return (value != null) && { 'align-items': value }
        },
    }
}
</script>
<style scoped>
.column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap; /* to disable bootstraps global CSS */
    margin: 0; /* to disable bootstraps global CSS */
}
</style>
