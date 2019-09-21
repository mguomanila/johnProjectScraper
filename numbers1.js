const fs = require('fs')
// const {EventEmitter} = require('events')
// const emitter = new EventEmitter()
// let range = []
// let numbers = []
const filename = './search.txt'

exports = module.exports = {
    numbers: getFromFile()
}

exports.modifyFile = function(n){
    fs.writeFile(filename,n.join('\n'), e => {
        if(e) throw e
        console.log('search file modified')
    })
}

function getFromFile(){
    saveToFile()
    let data
    const numbers = []
    try{
        data = fs.readFileSync(filename, 'utf8')
    } catch (e){
        console.log('error reading from file',e)
        return
    }
    data.split('\n').forEach( a => a ? numbers.push(a.trim()) : '' )
    return numbers
}

function saveToFile(){
    const numbers = search()
    if(!numbers) return 0
    fs.writeFileSync(filename,numbers.join('\n'))
}

function search(){
    const range = []
    const numbers = []
    let data
    try{
        data = fs.readFileSync(filename, 'utf8')
    } catch (e){
        console.log(e)
        return
    }
    data.split('\n').forEach( a => a ? range.push(a.trim()) : '' )
    if (range.length !==2) return 0
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
