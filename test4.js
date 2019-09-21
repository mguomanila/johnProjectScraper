const path = require('path')

const OUT_DIR = process.env.OUT_DIR || `downloads2`
const DOWNLOAD_PATH = path.resolve(__dirname, OUT_DIR)

console.log(DOWNLOAD_PATH)

