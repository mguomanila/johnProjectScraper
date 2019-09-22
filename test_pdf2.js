const fs = require('fs')
const path = require('path')
const PDFParser = require('pdf2json')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const OUT_DIR = process.argv[2].split('/')[0]

let pdfParser = new PDFParser(this,1)
const csvWriter = createCsvWriter({
    path: `${OUT_DIR}/test.csv`,
    header: [
        {id:'imiona', title: 'Imiona'},
        {id: 'nazwisko', title: 'Nazwisko'},
        {id: 'pesel', title: 'Numer PESEL'},
        ({id: 'dateofborn', title: 'Date of Born'})
    ]
})

let ar
let col1,col2,col3,col4
let text
const pattern_col1 = /imiona[\d-]*(\w*)\s?/gi
const pattern_col2 = /Nazwa\slub\sfirma[\d-]*([a-zAaĄąBbCcĆćDdEeĘęFfGgHhIiJjKkLlŁłMmNnŃńOoÓóPpRrSsŚśTtUuWwYyZzŹźŻż\s]+)\s?/gi
const pattern_col3 = /PESEL\/REGON([\d-]*)/gi
const records = []

pdfParser.on('pdfParser_dataError', err => console.log(err.parseError))

function fd(file){
    data = fs.readFileSync(file,'utf8')
    return data.length
} 

const log_writer = fs.createWriteStream(`${OUT_DIR}/log.txt`,{
    flags: 'w',
    encoding: 'utf8',
    fd: null,
    mode: 0o666,
    autoClose: true
})

pdfParser.on('pdfParser_dataReady', pdfData => {
    //fs.writeFile('./test_pdf.txt', pdfParser.getRawTextContent(), e => console.error(e))
    text = pdfParser.getRawTextContent()
    ar = text.split('.Nazwisko ')
    // ar.shift()
    ar.forEach( a => {
        try{
            col1 = [...a.matchAll(pattern_col1)]
            col2 = [...a.matchAll(pattern_col2)]
            col3 = [...a.matchAll(pattern_col3)]
        } catch(e){
            log_writer.write('\n\ntest\n\n'+a+'\n\n'+e+'\n'+a.match(pattern_col1),'utf8')
            return
        }
        if(!col1.length && !col2.length && !col3.length) return
        col1 = col1[0][1].replace(/-+/g,'').trim()
        if(col1==='******') return
        col2 = col2[0][1].replace(/[\r\n\d]+/g,'').trim()
        col3 = col3[0][1].replace(/\d+-+/g,'')
        if(col3==='--------') return
        col4 = col3.substring(0,6)
        records.push({imiona:col1,nazwisko:col2,pesel:col3,dateofborn:col4})
    })
    csvWriter.writeRecords(records)
    .then( e => {
        if(e) console.error(e)
        else console.log('csv save.')
    })
})

pdfParser.loadPDF(process.argv[2])
// pdfParser.loadPDF("./Rejestr\ Przedsiębiorców/odpis_pelny_586006_1569087237419.pdf")
// console.log(process.argv[2])