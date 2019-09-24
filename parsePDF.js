require('dotenv-safe').config({sample:'.env'})
const fs = require('fs')
const {resolve} = require('path')

const OUT_DIR1 = process.env.OUT_DIR1
const OUT_DIR2 = process.env.OUT_DIR2
const DOWNLOAD_PATH1 = resolve(__dirname, OUT_DIR1)
const DOWNLOAD_PATH2 = resolve(__dirname, OUT_DIR2)

const PdfParser = require('./pdf_parser2')

const folder = process.argv[2] //
const pdfParser = PdfParser({path:folder})

fs.readdir(folder, (e,files)=>{
    files.forEach( f => {
        if(f.includes('pdf')){
            console.log(`${folder}/${f}`)
            pdfParser(f)
            // console.log(f)
        }
    })
})