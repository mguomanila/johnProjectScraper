const fs = require('fs')
// const {EventEmitter} = require('events')

// const emitter = new EventEmitter()
// let range = []
// let numbers = []

module.exports = {
    numbers: search(),
}

function search(){
    const range = []
    const numbers = []
    let data
    try{
        data = fs.readFileSync('./search.txt', 'utf8')
    } catch (e){
        console.log(e)
        return
    }
    data.split('\n').forEach( a => a ? range.push(a.trim()) : '' )
    const start = parseInt(range[0])
    const finish = parseInt(range[1])
    for (let i=start; i<finish; i++){
        let num = start+i
        numbers.push(num.toString().padStart(10,'0'))
    }
    return numbers
}
// fs.readFile('./search.txt', 'utf8', (e,d) => {
//     if(e) {
//         console.log(e)
//         return
//     } else {
//         d.split('\n').forEach( a => a ? range.push(a.trim()):'' )
//     }
//     const start = parseInt(range[0])
//     const finish = parseInt(range[1])
//     for (let i=start; i<finish; i++){
//         let num = start+i
//         numbers.push(num.toString().padStart(10,'0'))
//     }
//     emitter.emit('numbers', numbers)
// })

process.on('uncaughtException', e => {
    console.log('exception on numbers',e)
})
