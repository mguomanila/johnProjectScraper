const fs = require('fs')
// const async = require('async')

// let range = []
// let numbers = []

const filename = process.argv[2]
getFromFile(filename)

// async.series([
//     () => fs.readFile(filename, 'utf8', (e,d) => {
//         if(e) {
//             console.log(e)
//             return
//         } else {
//             d.split('\n').forEach( a => a ? range.push(a.trim()):'' )
//         }
//         const start = parseInt(range[0])
//         const finish = parseInt(range[1])
//         for (let i=start; i<finish; i++){
//             let num = start+i
//             numbers.push(num.toString().padStart(10,'0'))
//         }
//         console.log('1')
//     }),
//     () => module.exports = { numbers: numbers },
//     () => console.log('2')
// ], (e,r) => console.log(r) )

function getFromFile(filename){
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