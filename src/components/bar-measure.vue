<template>
    <column ref=barMeasure class=bar-measure-container shadow=2>
        <div class=bar-cursor :style="`position: absolute; top: ${barCursorPosition}px;`" >
            {{barCursorContent}}
        </div>
    </column>
</template>

<script>


export let barMeasure

export default {
    name: 'bar-measure',
    beforeCreate() {
        // attach to variable since this component is a singleton
        barMeasure = this
    },
    data: ()=>({
        // data
        barCursorHeightPercent: 0,
        barCursorContent: "",
        // listeners
        listenFor$: {
            updateBar({barCursorHeightPercent, barCursorContent}) {
                this.barCursorHeightPercent = barCursorHeightPercent
                this.barCursorContent = barCursorContent
            }
        }
    }),
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