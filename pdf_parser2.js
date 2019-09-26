const fs = require('fs')
const {PdfReader} = require('pdfreader')

const pdfReader = new PdfReader()
let {event} = require('./utility')

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

let csvWriter

const csv_writer = async function(csv_file){
    if(!fs.existsSync(csv_file)){
        await new Promise( resolve => {
            setTimeout( () => resolve(), 1e3)
            csvWriter = fs.createWriteStream(csv_file,{
                flags: 'w+',
                encoding: 'utf8',
                fd: null,
                mode: 0o666,
                autoClose: true
            })
        })
        csvWriter.write(`Imiona, Nazwisko, Numer PESEL, Date of Born\n`)
    }else {
        await new Promise( resolve => {
            setTimeout( () => resolve(), 1e3)
            csvWriter = fs.createWriteStream(csv_file,{
                flags: 'a+',
                encoding: 'utf8',
                fd: null,
                mode: 0o666,
                autoClose: true
            })
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
            setTimeout( () => resolve(), t*5 )
        })
        const pattern_col1 = /imiona[\d\n-]*([a-zAaĄąBbCcĆćDdEeĘęFfGgHhIiJjKkLlŁłMmNnŃńOoÓóPpRrSsŚśTtUuWwYyZzŹźŻż\*]*)\s?/gi
        const pattern_col2 = /Nazwa\slub\sfirma[\d\n-]*([a-zAaĄąBbCcĆćDdEeĘęFfGgHhIiJjKkLlŁłMmNnŃńOoÓóPpRrSsŚśTtUuWwYyZzŹźŻż\s]+)\s?/gi
        const pattern_col3 = /PESEL\/REGON[\d\n-]*(\d{11})/gi
        const records = []
        let col1,col2,col3,col4
        ar = text.split('.Nazwisko ')
        ar.forEach( a => {
            try{
                col1 = [...a.matchAll(pattern_col1)]
                col2 = [...a.matchAll(pattern_col2)]
                col3 = [...a.matchAll(pattern_col3)]
                if(!col1.length && !col2.length && !col3.length) return
                col1 = col1[0][1].trim()
                if(col1.includes('*****')) return
                col2 = col2[0][1].replace(/[\r\n\d]+/g,'').trim()
                col3 = col3[0][1]
                if(col3.includes('------')) return
                col4 = col3.substring(0,6)
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