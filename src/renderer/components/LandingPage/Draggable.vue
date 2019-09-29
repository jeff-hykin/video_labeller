<template>
    <div class="point" :style="{ left: `${this.newX}px`, top: `${this.newY}px` }" @click="toggleDrag"></div>
</template>
<script>
    export default {
        name:  "point",
        props: ['x', 'y', 'uniqueName'],
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
                        this.newX += e.movementX;
                        this.newY += e.movementY;
                        this.$emit('moved',{x: this.newX, y: this.newY, uniqueName: this.$props.uniqueName})
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
        transform: translate(-50%, -50%);
        background-color: red;
        height: 15px;
        width: 15px;
    }
</style>
