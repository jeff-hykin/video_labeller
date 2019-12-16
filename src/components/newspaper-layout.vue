<script>

const PADDING = 20
export default {
    data:()=>({
       init: true 
    }),
    render(createElement) {
        // 
        // on first render be empty
        // 
        if (this.init) {
            this.init = false
            // immediately call another render
            setTimeout(() => {
                this.$forceUpdate()
            }, 0)
            console.log(`init`)
            return <div class="newspaper-layout" style={{width: this.$props.width}}>
                <div class="newspaper-layout" style={{width: this.$props.columnWidth, height: '10rem'}} />
            </div>
        }
        
        
        let columnsElements = [
            // first column
            createElement("div", { class:"newspaper-column", style:{width: this.$props.columnWidth} }, [])
        ]
        let mainContainer = createElement("div", { class:"newspaper-layout", style:{width: this.$props.width} }, columnsElements)
        
        
        // 
        // generate columns
        // 
        console.log(`this.$el is:`,this.$el)
        try {
            var mainContainerWidthInPixels = window.getComputedStyle(this.$el).width.replace(/px/,"")-0
            var columnWidth = window.getComputedStyle(this.$el.children[0]).width.replace(/px/,"")-0
            console.log(`mainContainerWidthInPixels is:`,mainContainerWidthInPixels)
            console.log(`columnWidth is:`,columnWidth)
        } catch (error) {
            setTimeout(() => {
                console.log(`$forceUpdating`)
                this.$forceUpdate()
            }, 1000)
            console.log(`hit error`)
            return createElement(
                "div",
                { class:"newspaper-layout", style:{width: this.$props.width} },
                [
                    createElement("div", { class:"newspaper-column", style:{width: this.$props.columnWidth, height: "10rem"} }, [ "child elem"  ])
                ]
            )
        }
        
        
        let numberOfRows = mainContainerWidthInPixels / columnWidth
        let remainingSpace = mainContainerWidthInPixels
        let columns = []
        while (remainingSpace > columnWidth) {
            remainingSpace -= (columnWidth + PADDING * 2)
            columns.push([])
        }
        console.log(`columns length is:`,columns.length)
        
        // 
        // distribute elements evenly among columns
        // 
        let children = [...this.$slots.default]
        while (children.length > 0) {
            for (let eachColumn of columns) {
                while (children.length > 0) {
                    let child = children.shift()
                    if (child instanceof Object && child.tag != undefined) {
                        eachColumn.push(child)
                        break
                    }
                }
                if (children.length == 0) {
                    break 
                }
            }
        }
        console.log(`columns is:`,columns)
        return createElement(
            "div",
            { class:"newspaper-layout", style:{width: this.$props.width, display:'flex', flexDirection: 'row',} },
            columns.map(columnChildren=>{
                // create columns
                return createElement(
                    "div",
                    {
                        class:"newspaper-column",
                        style:{
                            width: this.$props.columnWidth,
                            padding: `${PADDING}px`,
                        }
                    },
                    columnChildren
                )
            })
        )
    },
    props: {
        columnWidth: {
            type: String,
            required: true,
        },
        width: {
            type: String,
            required: true,
        },
    },
}
</script>

<style lang="scss" scoped>
.newspaper-layout {
    .newspaper-column {
        height: 'fit-content'
    }
}
</style>