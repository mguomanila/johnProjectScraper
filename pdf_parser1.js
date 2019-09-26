const fs = require('fs')
const PDFParser = require('pdf2json')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const pdfParser = new PDFParser(this,true)
let {event} = require('./utility')

// pdfParser.load2 = function(file){
//     pdfParser.load(pdfParser.OUT_DIR+"/"+file)
// }

pdfParser.on('pdfParser_dataError', err => console.log(err.parseError))

const log_writer = function(log_file){
    return fs.createWriteStream(log_file,{
        flags: 'a+',
        encoding: 'utf8',
        fd: null,
        mode: 0o666,
        autoClose: true
    })
}

const csv_writer = function(csv_file){

    if(!fs.existsSync(csv_file)){
        csvWriter = createCsvWriter({
            path: csv_file,
            header: [
                {id:'imiona', title: 'Imiona'},
                {id: 'nazwisko', title: 'Nazwisko'},
                {id: 'pesel', title: 'Numer PESEL'},
                ({id: 'dateofborn', title: 'Date of Born'})
            ]
        })
    }else {
        csvWriter = fs.createWriteStream(csv_file,{
            flags: 'a+',
            encoding: 'utf8',
            fd: null,
            mode: 0o666,
            autoClose: true
        })
    }
    if(!csvWriter.writeRecords){
        csvWriter.writeRecords = async(records)=>{
            await new Promise ( resolve => {
                records.forEach( record => {
                    csvWriter.write(`${record.imiona},${record.nazwisko},${record.pesel},${record.dateofborn}\n`)
                })
                resolve()
            })
        }
    }
    return csvWriter
}

// pdfParser.load(file)
module.exports = function(init){

    const OUT_DIR = pdfParser.OUT_DIR = init.path
    const cwriter = csv_writer(`${OUT_DIR}/test.csv`)
    const lwriter = log_writer(`${OUT_DIR}/log.txt`)

    const pattern_col1 = /imiona[\d-]*(\w*)\s?/gi
    const pattern_col2 = /Nazwa\slub\sfirma[\d-]*([a-zAaĄąBbCcĆćDdEeĘęFfGgHhIiJjKkLlŁłMmNnŃńOoÓóPpRrSsŚśTtUuWwYyZzŹźŻż\s]+)\s?/gi
    const pattern_col3 = /PESEL\/REGON[\d-]+([\d]{11})/gi

    pdfParser.on('pdfParser_dataReady', pdf => {
        let text, ar
        // console.log('pdf data',pdf.formImage.Pages)
        text = pdfParser.getRawTextContent()

        const records = []
        let col1,col2,col3,col4
        ar = text.split('.Nazwisko ')
        ar.forEach( a => {
            try{
                col1 = [...a.matchAll(pattern_col1)]
                col2 = [...a.matchAll(pattern_col2)]
                col3 = [...a.matchAll(pattern_col3)]
                if(!col1.length && !col2.length && !col3.length) return
                col1 = col1[0][1].trim()//.replace(/-+/g,'')
                if(col1.includes('*****')) return
                col2 = col2[0][1].replace(/[\r\n\d]+/g,'').trim()
                col3 = col3[0][1]//.replace(/\d+-+/g,'')
                if(col3.includes('-------')) return
                col4 = col3.substring(0,6)
            } catch(e){
                lwriter.write('\n==parser==\n'+a+'\n'+e+'\n'+a.match(pattern_col1),'utf8')
                return
            }
            records.push({
                imiona:col1,
                nazwisko:col2,
                pesel:col3,
                dateofborn:col4})
        })
        cwriter.writeRecords(records)
        .then( e => {
            if(e) {console.error(e);process.exit(1)}
            console.log('csv save.')
            // event.emit('csv_save')
        })
    
    })

    return pdfParser
}

module.exports.event = event