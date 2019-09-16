const {numbers:search} = require('./numbers.js')

console.log(search.length)
console.log(search.pop())
console.log(search.pop())
console.log(search.pop())

// function callback(){
//     search.on('numbers', numbers => {
//         console.log('t1',numbers.pop())
//         console.log('t2',numbers.pop())
//         // console.log('t3',numbers)
//     })
// }
//
// function test(callback){
//     callback()
// }
//
// ;(async () => {
//     test(callback)
//
//     search.on('numbers', numbers => {
//         console.log('t3',numbers.pop())
//         console.log('t4',numbers.pop())
//         // console.log('t3',numbers)
//     })
//
//     search.on('numbers', numbers => {
//         console.log('t5',numbers.pop())
//         console.log('t6',numbers.pop())
//         // console.log('t3',numbers)
//     })
// })()
