import Vue from 'vue'


// if you have JSX enabled
// importing this will enable you to make very consice components like this:
// 
//     // one-liner arrow function component
//     let helloWorld = (h) => <div class=hello-world>Hello World</div>
//     // wrap it with vue extend
//     helloWorld = Vue.extend(helloWorld)
// 
//     // use in the same file as a vue component
//     export default {
//         components: { 
//             helloWorld
//         },
//     }
// 
// NOTE: the `h` variable is a necessary first argument
// 
// here's another example:
//     let miniComponent = Vue.extend(
//         (h, {data, children}, {prop1, prop2, prop3}) => {
//             if (prop1) {
//                 return <div>{children}</div>
//             } else {
//                 return <button>{prop2}</button>
//             }
//         }
//     )
// 

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