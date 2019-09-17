const fs = require('fs')
const PDFParser = require('pdf2json')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

let pdfParser = new PDFParser(this,1)
const csvWriter = createCsvWriter({
    path: './sample.csv',
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
const pattern_col1 = /imiona\d*([\w-*]*)\s?/gi
const pattern_col2 = /Nazwa\slub\sfirma\d+([\w\s]*)/gi
const pattern_col3 = /PESEL\/REGON([\d-]*)/gi
const records = []

pdfParser.on('pdfParser_dataError', err => console.log(err.parseError))
pdfParser.on('pdfParser_dataReady', pdfData => {
    //fs.writeFile('./test_pdf.txt', pdfParser.getRawTextContent(), e => console.error(e))
    text = pdfParser.getRawTextContent()
    ar = text.split('.Nazwisko ')
    // ar.shift()
    ar.forEach( a => {
        col1 = [...a.matchAll(pattern_col1)]
        col2 = [...a.matchAll(pattern_col2)]
        col3 = [...a.matchAll(pattern_col3)]
        if(!col1.length && !col2.length && !col3.length) return
        col1 = col1[0][1].replace(/-+/g,'').trim()
        col2 = col2[0][1].replace(/[\r\n\d]+/g,'').trim()
        col3 = col3[0][1].replace(/\d+-+/g,'')
        col4 = col3.substring(0,6)
        records.push({imiona:col1,nazwisko:col2,pesel:col3,dateofborn:col4})
    })
    csvWriter.writeRecords(records).then( e => {if(e) console.error(e); else console.log('csv save.')})
})

pdfParser.loadPDF('./odpis_pelny_66488_1568043354713.pdf')

