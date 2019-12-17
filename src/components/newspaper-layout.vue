<script>

// TODO:
    // improve the init
    // use resize observer for parent element
    //     https://developers.google.com/web/updates/2016/10/resizeobserver

let pxToInt = (value) => value.replace(/px/,"")-0

export default {
    data:()=>({
        init: true,
        windowListeners$: {
            // update whenever the window is resized
            resize() {
                this.$forceUpdate()
            }
        }
    }),
    render() {
        
        let createColumn = (columnChildren=[]) => <div
            class="newspaper-column"
            style={{
                ...this.$props.columnStyle
            }}
            >
            {columnChildren}
        </div>
        
        let createContainer = (children=[]) => <div
            class="newspaper-layout"
            style={{
                width: this.$props.width,
                display:'flex',
                flexDirection: 'row',
                justifyContent: 'space-evenly'
            }}
            >
            {children}
        </div>
        
        // 
        // try to look at the size of the existing element 
        // 
        try {
            // retrive the actual widths
            var mainContainerStyles = window.getComputedStyle(this.$el)
            var columnStyles        = window.getComputedStyle(this.$el.children[0])
            window.columnStyles = columnStyles
        // 
        // if the element doesn't exist, then create one with the correct widths and retry
        // 
        } catch (error) {
            // immediately reload element
            setTimeout(() => { this.$forceUpdate() }, 0)
            return createContainer(createColumn())
        }
        
        let avalibleWidth = pxToInt(mainContainerStyles.width)
        let columnWidth   = 0
        columnWidth += pxToInt(columnStyles.width)
        columnWidth += pxToInt(columnStyles.marginLeft)
        columnWidth += pxToInt(columnStyles.marginRight)
        if (columnStyles.boxSizing == 'content-box') {
            columnWidth += pxToInt(columnStyles.paddingLeft)
            columnWidth += pxToInt(columnStyles.paddingRight)
        }
        
        // 
        // calculate how many columns
        // 
        avalibleWidth -= columnWidth // ensure there's always at least one column
        let columns = [ [] ]
        while (avalibleWidth > columnWidth) {
            avalibleWidth -= columnWidth
            columns.push([])
        }
        
        // 
        // distribute elements
        // 
        // right-to-left, then top-to-bottom
        let children = [...this.$slots.default]
        while (children.length > 0) {
            for (let eachColumn of columns) {
                while (true) {
                    // if none left, then break
                    if (children.length == 0) {
                        break
                    }
                    
                    let child = children.shift()
                    
                    // if child is invalid, try again
                    if (!(child instanceof Object) || child.tag == undefined) {
                        continue
                    }
                    
                    // put it in the column
                    eachColumn.push(child)
                    // move to the next column
                    break
                }
                if (children.length == 0) {
                    break 
                }
            }
        }
        
        // 
        // render the main vue
        // 
        return createContainer(columns.map(createColumn))
    },
    props: {
        columnStyle: {
            type: Object,
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