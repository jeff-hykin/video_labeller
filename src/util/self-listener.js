//
// usage
//
// to use this appropriately
// on the receiver side do
// receiverComponent = new (Vue.extend({
//     mixins: [ tellerMixin ],
//     data: ()=>({
//         canBeTold$: {
//             sayHello: true
//         }
//     }),
//     methods: {
//         sayHello(name) {
//             return `Hello ${name}`
//         }
//     }
// }))
// 
// on the sender side do
// let response = senderComponent.tell$(receiverComponent).sayHello("bob")
// console.log(`response is:`,response) // should be "Hello bob"


export default {
    data() {
        return {
            canBeTold$: {},
        }
    },
    methods: {
        tell$(component) {
            let sender = this
            // Proxys are wonderful magical javascript
            // however they are very advanced
            return new Proxy({}, {
                get: function(target, key) {
                    if (component.canBeTold$[key]) {
                        // then call the function and return its value
                        component.sender$ = sender
                        return (...args)=> component[key](...args, sender)
                    } else {
                        console.error(`When using $tell, the component`)
                    }
                },
            })
        },
    },
}
