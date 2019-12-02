
// 
// usage
// 
// to use this appropriately
// on the receiver side do
// {
//     data: ()=>({
//         listenFor$: {
//             doTheThing(args) {
//                 console.log(`args is:`,args)
//                 console.log(`this.sender$ is:`,this.sender$)
//             }
//         }
//     })
// }
// on the sender side do
// thatComponentInstance.tell$({
//     say:'doTheThing',
//     from:'your sibbiling, the blah component',
//     args:["hello", "world"]
// })

export default {
    data: ()=>({
        sender$: null,
        listenFor$: {}
    }),
    created() {
        for (let each in this.listenFor$) {
            if (this.listenFor$[each] instanceof Function) {
                // bind all of them to the component
                this.listenFor$[each] = this.listenFor$[each].bind(this)
            }
        }
    },
    methods: {
        tell$({say, from, args}) {
            if (this.listenFor$[say] instanceof Function) {
                this.sender$ = from
                this.listenFor$[say](...args)
                this.sender$ = null
            } else {
                console.error(`\n\nThere is a $tell being called.\nHowever, it appears the receiver doesn't know what to do with the event\n   say: "${say}"\nfrom: "${from}"\nreceiver:\n`, this)
            }
        }
    }
}