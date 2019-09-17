const fs = require('fs')
const PDFParser = require('pdf2json')

let pdfParser = new PDFParser()

pdfParser.on('pdfParser_dataError', err => console.log(err.parseError))
pdfParser.on('pdfParser_dataReady', pdfData => {
    fs.writeFile('./test_pdf.json', JSON.stringify(pdfData), e => console.error(e))
})

pdfParser.loadPDF('./odpis_pelny_66488_1568043354713.pdf')