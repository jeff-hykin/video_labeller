import Vue from 'vue'

let copyFunc = (someFunction,theContext=this) => (...args) => someFunction.apply(theContext,args)

let originalVueExend = copyFunc(Vue.extend, Vue)

Vue.extend = function(...args) {
    if (args.length == 1 && args[0] instanceof Function) {
        let object = {
            functional: true,
        }
        let boundRender = args[0].bind(object)
        object.render = function(h, context) {
            context.children = context.children instanceof Array ? context.children : []
            return boundRender(h, context, context.props)
        } 
        return originalVueExend(object)
    } else {
        return originalVueExend(...args)
    }
}