<template>
    <div class="point" :style="{ left: `${this.newX}px`, top: `${this.newY}px`, cursor: dragging? 'move':'pointer', color }" @click="activateDrag">
        <ui-tooltip position="top" animation="fade">{{ $props.uniqueName }}</ui-tooltip>
        <svg width=100% height=100%>
            <line x1="0" y1="0" x2="100%" y2="100%" :style="{strokeWidth, stroke: color}">
                <rainbow-line-animation />
            </line>
            <line x1="100%" y1="0" x2="1" y2="100%" :style="{strokeWidth, stroke: color}">
                <rainbow-line-animation />
            </line>
        </svg>
    </div>
</template>
<script>
    import RainbowLineAnimation from './rainbow-line-animation'
    export default {
        components: {
            RainbowLineAnimation
        },
        name:  "point",
        props: ['x', 'y', 'uniqueName'],
        data: function() {
            return {
                newX: this.$props.x,
                newY: this.$props.y,
                dragging: false,
                color: '#ef5350',
                strokeWidth: '5%',
            }
        },
        mounted: function() {
            this.newX = this.$props.x
            this.newY = this.$props.y
            this.colorIndex = 0
            // setInterval(() => {
            //     this.colorIndex++
            //     this.colorIndex = this.colorIndex % this.colors.length
            //     this.color = this.colors[this.colorIndex]
            // }, 250);
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
        --size: 16px;
        transition: color 0.2s ease-in;
        cursor: move;
        position: absolute;
        transform: translate(-50%, -50%);
        /* background-color: red; */
        height: var(--size);
        width: var(--size);
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
