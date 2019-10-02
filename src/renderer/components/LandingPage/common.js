export const component = {
    props: {
        'wrap':{
            type: [String, Boolean],
            validator: (value) => [true, false, 'reverse'].includes(value)
        },
        'shadow': {
            type: [Number, String],
        }
    },
    computed: {
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
            let shadow = this.$props.shadow || this.$attrs["box-shadow"]
            let value = shadow
            if (shadow == 0) {
                value = 'none'
            } else if (shadow == 1) {
                value = '0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.2)'
            } else if (shadow == 2) {
                value = '0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.3)'
            } else if (shadow == 3) {
                value = '0 8px 17px 2px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12), 0 5px 5px -3px rgba(0,0,0,0.2)'
            } else if (shadow == 4) {
                value = '0 16px 24px 2px rgba(0,0,0,0.14), 0 6px 30px 5px rgba(0,0,0,0.12), 0 8px 10px -7px rgba(0,0,0,0.2)'
            } else if (shadow == 5) {
                value = '0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.2)'
            }
            return shadow && { 'box-shadow':value, '-webkit-box-shadow': value }
        }
    }
}