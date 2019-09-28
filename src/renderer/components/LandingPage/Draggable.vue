<template>
<div class="point" :style="{ left: `${this.newX}px`, top: `${this.newY}px` }" @click="toggleDrag">X</div>
</template>
<script>
export default {
    name:  "point",
    props: ['x', 'y'],
    data: function() {
        return {
            newX: this.$props.x,
            newY: this.$props.y,
            dragging: false,
            eventListener: null
        }
    },
    mounted: function() {
        this.newX = this.$props.x
        this.newY = this.$props.y
    },
    computed: {
    },
    methods: {
        toggleDrag(e) {
            if (!this.eventListener) {
                this.eventListener = e => {
                    this.newX = e.clientX - 10;
                    this.newY = e.clientY - 10;
                }
                window.addEventListener('mousemove', this.eventListener)
            } else {
                window.removeEventListener('mousemove', this.eventListener)
                this.eventListener = null
            }
        },
    },
}
</script>
<style scoped>
.point {
    cursor: move;
    position: absolute;
    color: red;
    width: 20px;
    height: 20px;
}
</style>
