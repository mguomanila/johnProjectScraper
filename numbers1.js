const fs = require('fs')


exports = module.exports =  getFromFile

exports.modifyFile = function(n, filename){
    fs.writeFile(filename,n.join('\n'), e => {
        if(e) throw e
        console.log('search file modified')
    })
}

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
    while(start<finish) 
        numbers.push((++start+1).toString().padStart(10,'0'))
    return numbers
}

process.on('uncaughtException', e => {
    console.log('exception on numbers',e)
})
