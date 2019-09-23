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

async function getFromFile(filename){
    await saveToFile(filename)
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

async function saveToFile(filename){
    const numbers = await search(filename)
    if(!numbers) return 0
    fs.writeFileSync(filename,numbers.join('\n'))
}

async function search(filename){
    const range = []
    const numbers = []
    let data
    try{
        data = fs.readFileSync(filename, 'utf8')
    } catch (e){
        console.log(e)
        return
    }
    await Promise.all([
        data.split('\n').forEach( a => a ? range.push(a.trim()) : '' ),
    ])
    if (range.length !== 2) return 0
    let start = parseInt(range[0])-2,
        finish = parseInt(range[1])-1

    // for (let i=start; i<finish; i++){
    //     let num = start+i
    //     numbers.push(num.toString(10).padStart(10,'0'))
    // }
    while(start<finish) 
        numbers.push((++start+1).toString().padStart(10,'0'))
    // console.log(numbers.length)
    // console.log(numbers)
    // process.exit(1)

    return numbers
}