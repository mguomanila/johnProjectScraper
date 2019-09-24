require('dotenv-safe').config({sample:'.env'})
const {resolve} = require('path')

const OUT_DIR1 = process.env.OUT_DIR1
const OUT_DIR2 = process.env.OUT_DIR2
const DOWNLOAD_PATH1 = resolve(__dirname, '..', OUT_DIR1)
const DOWNLOAD_PATH2 = resolve(__dirname, '..', OUT_DIR2)

const pdfParser = require('../pdf_parser2')({path:DOWNLOAD_PATH1})

let ar = [
    "pdfParser('odpis_pelny_189144_1569158389018.pdf')",
    "pdfParser('odpis_pelny_189145_1569157164588.pdf')",
    "pdfParser('odpis_pelny_189146_1569154429076.pdf')",
    "pdfParser('odpis_pelny_189147_1569149366524.pdf')",
    "pdfParser('odpis_pelny_586006_1569087237419.pdf')",
]

for(let i=0; i<4; i++){
   eval(ar[i])
}