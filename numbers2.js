const fs = require('fs')
const async = require('async')

let range = []
let numbers = []

async.series([
    () => fs.readFile('./search.txt', 'utf8', (e,d) => {
        if(e) {
            console.log(e)
            return
        } else {
            d.split('\n').forEach( a => a ? range.push(a.trim()):'' )
        }
        const start = parseInt(range[0])
        const finish = parseInt(range[1])
        for (let i=start; i<finish; i++){
            let num = start+i
            numbers.push(num.toString().padStart(10,'0'))
        }
        console.log('1')
    }),
    () => module.exports = { numbers: numbers },
    () => console.log('2')
], (e,r) => console.log(r) )
