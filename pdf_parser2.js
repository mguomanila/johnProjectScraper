const fs = require('fs')
const {PdfReader} = require('pdfreader')

const pdfReader = new PdfReader()
let {event,convertDate} = require('./utility')

const log_writer = function(log_file){
    if(!fs.existsSync(log_file)){
        fs.writeFileSync(log_file,'')
    }
    return fs.createWriteStream(log_file,{
        flags: 'a+',
        encoding: 'utf8',
        fd: null,
        mode: 0o666,
        autoClose: true
    })
}

const csv_writer = async function(csv_file){
    const file_exists = fs.existsSync(csv_file)
    let csvWriter
    const flags = {
        encoding: 'utf8',
        fd: null,
        mode: 0o666,
        autoClose: true
    }
    if(!file_exists){
        flags.flags = 'w+'
        await new Promise( resolve => {
            setTimeout( () => resolve(), 1e3)
            csvWriter = fs.createWriteStream(csv_file,flags)
        })
        csvWriter.write(`Imiona, Nazwisko, Numer PESEL, Date of Born\n`)
    }else {
        flags.flags = 'a+'
        await new Promise( resolve => {
            setTimeout( () => resolve(), 1e3)
            csvWriter = fs.createWriteStream(csv_file,flags)
        })
    }
    csvWriter.writeRecords = async (records)=>{
        await new Promise ( resolve => {
            records.forEach( record => {
                csvWriter.write(`${record.imiona},${record.nazwisko},${record.pesel},${record.dateofborn}\n`)
            })
            setTimeout( () => resolve(), 1e3)
        })
    }
    csvWriter.check = async(record)=>{
        let temp = []
        function mixin(r,s){
            Object.keys(s).forEach( k => r[k]=s[k] )
            return r
        }
        await Promise.all([
            record.forEach( s => {
                temp.push(mixin({},s))
            })
        ])
        function duplicate(a,b){
            let keys = Object.keys
            if(keys(a).length!=keys(b).length) return false
            for(let k of keys(a)){
                if(a[k]!==b[k]) {
                    return false
                }
            }
            return true
        }
        for(let i=0; i<parseInt(record.length/2); i++){
            let j = i+1
            while(j<temp.length){
                if(duplicate(temp[i],temp[j])){
                    temp.splice(j,1)
                    j=i
                }
                j++
            }
        }
        return temp
    }
    return csvWriter
}

module.exports = async function(init){
    const OUT_DIR = init.path
    cwriter = await csv_writer(`${OUT_DIR}/test.csv`)
    lwriter = await log_writer(`${OUT_DIR}/log.txt`)
    return async function reader(file){
        let text = ''
        const t = 1e3
        await new Promise( resolve => {
            pdfReader.parseFileItems(OUT_DIR+'/'+file, (e,item)=>{
                if(item && item.text){
                    text += text 
                        ? item.text + '\n'
                        : item.text
                }
            })
            setTimeout( () => resolve(), t*3 )
        })
        const pattern_col1 = /imiona[\d\n-]*([a-zAaĄąBbCcĆćDdEeĘęFfGgHhIiJjKkLlŁłMmNnŃńOoÓóPpRrSsŚśTtUuWwYyZzŹźŻż\*]*)\s?/gi
        const pattern_col2 = /Nazwa\slub\sfirma[\d\n-]*([a-zAaĄąBbCcĆćDdEeĘęFfGgHhIiJjKkLlŁłMmNnŃńOoÓóPpRrSsŚśTtUuWwYyZzŹźŻż\s]+)\s?/gi
        const pattern_col22= /([a-zAaĄąBbCcĆćDdEeĘęFfGgHhIiJjKkLlŁłMmNnŃńOoÓóPpRrSsŚśTtUuWwYyZzŹźŻż\n\s]+)(?=2\.Imiona)/gi
        const pattern_col3 = /PESEL\/REGON[\d\n-]*(\d{11})/gi
        const pattern_col33 = /3\.Numer\sPESEL[\d\n-]*(\d{11})/gi
        let records = []
        let col1,col2,col3,col4
        ar = text.split('.Nazwisko')
        await Promise.all([
            ar.forEach( a => {
                try{
                    col1 = [...a.matchAll(pattern_col1)]
                    col2 = [...a.matchAll(pattern_col2)]
                    col3 = [...a.matchAll(pattern_col3)]
                    if(!col1.length && !col2.length && !col3.length) return
                    col1 = col1[0][1].trim()
                    if(col1.includes('*****')) return
                    try{
                        col2 = col2[0][1].replace(/[\r\n\d]+/g,'').trim()
                    } catch(e){
                        col2 = [...a.matchAll(pattern_col22)]
                        col2 = col2[0][1].replace(/[\r\n\d]+/g,'').trim().split(/\s/)[0]
                    }
                    try{
                        col3 = col3[0][1]
                    } catch(e){
                        col3 = [...a.matchAll(pattern_col33)]
                        col3 = col3[0][1]
                    }
                    if(col3.includes('------')) return
                    col4 = convertDate(col3.substring(0,6))
                } catch(e){
                    lwriter.write('\n\n==parser==\n'+a+'\n'+e+'\n','utf8')
                    return
                }
                records.push({
                    imiona:col1,
                    nazwisko:col2,
                    pesel:col3,
                    dateofborn:col4})
            })    
        ])
        records = await cwriter.check(records)
        try{
            await cwriter.writeRecords(records)
        } catch (e){
            console.error(e)
            process.exit(1)
        }
        console.log('csv save.')
    }
}

module.exports.event = event
