<template>
    <div class="point" :style="{ left: `${this.newX}px`, top: `${this.newY}px`, cursor: dragging? 'move':'pointer', color }" @click="activateDrag">
        <svg class="icon icon-cross"><use xlink:href="#icon-cross"></use></svg>
        <symbol id="icon-cross" viewBox="0 0 32 32">
        <title>cross</title>
            <animate attributeName="fill" values="red;blue;red" dur="10s" repeatCount="indefinite" />
            <path d="M31.708 25.708c-0-0-0-0-0-0l-9.708-9.708 9.708-9.708c0-0 0-0 0-0 0.105-0.105 0.18-0.227 0.229-0.357 0.133-0.356 0.057-0.771-0.229-1.057l-4.586-4.586c-0.286-0.286-0.702-0.361-1.057-0.229-0.13 0.048-0.252 0.124-0.357 0.228 0 0-0 0-0 0l-9.708 9.708-9.708-9.708c-0-0-0-0-0-0-0.105-0.104-0.227-0.18-0.357-0.228-0.356-0.133-0.771-0.057-1.057 0.229l-4.586 4.586c-0.286 0.286-0.361 0.702-0.229 1.057 0.049 0.13 0.124 0.252 0.229 0.357 0 0 0 0 0 0l9.708 9.708-9.708 9.708c-0 0-0 0-0 0-0.104 0.105-0.18 0.227-0.229 0.357-0.133 0.355-0.057 0.771 0.229 1.057l4.586 4.586c0.286 0.286 0.702 0.361 1.057 0.229 0.13-0.049 0.252-0.124 0.357-0.229 0-0 0-0 0-0l9.708-9.708 9.708 9.708c0 0 0 0 0 0 0.105 0.105 0.227 0.18 0.357 0.229 0.356 0.133 0.771 0.057 1.057-0.229l4.586-4.586c0.286-0.286 0.362-0.702 0.229-1.057-0.049-0.13-0.124-0.252-0.229-0.357z"></path>
        </symbol>
    </div>
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
                color: 'red'
            }
        },
        mounted: function() {
            this.newX = this.$props.x
            this.newY = this.$props.y
            this.colors = [ '#ef5350', '#ec407a', '#ab47bc', '#7e57c2', '#5c6bc0', '#42a5f5', '#29b6f6', '#26c6da', '#26a69a', '#66bb6a', '#9ccc65', '#d4e157', '#ffee58', '#ffca28', '#ffa726', '#ff7043']
            this.colorIndex = 0
            setInterval(() => {
                this.colorIndex++
                this.colorIndex = this.colorIndex % this.colors.length
                this.color = this.colors[this.colorIndex]
            }, 250);
        },
        computed: {
        },
        methods: {
            movementCatcher(e) {
                this.newX += e.movementX;
                this.newY += e.movementY;
                this.$emit('moved',{x: this.newX, y: this.newY, uniqueName: this.$props.uniqueName})
            },
            activateDrag(e) {
                if (!this.dragging) {
                    // attach movement listener
                    window.addEventListener('mousemove', this.movementCatcher)
                    // attach deactivateDrag listener
                    setTimeout(_=>window.addEventListener('click', this.deactivateDrag),0)
                    this.dragging = true
                }
            },
            deactivateDrag() {
                if (this.dragging) {
                    // remove both listeners
                    window.removeEventListener('mousemove', this.movementCatcher)
                    window.removeEventListener('click', this.deactivateDrag)
                    this.dragging = false
                }
            }
        },
        destroyed() {
            // just encase things get messed up somehow
            window.removeEventListener('mousemove', this.movementCatcher)
            window.removeEventListener('click', this.deactivateDrag)
        }
    }
</script>
<style scoped>
    .point {
        transition: color 0.2s ease-in;
        cursor: move;
        position: absolute;
        transform: translate(-50%, -50%);
        /* background-color: red; */
        height: fit-content;
        width: fit-content;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    /* -----
SVG Icons - svgicons.sparkk.fr
----- */

.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  stroke-width: 0;
  stroke: currentColor;
  fill: currentColor;
}
</style>
