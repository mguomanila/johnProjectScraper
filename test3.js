const fs = require('fs')
const puppet = require('puppeteer')

const crawledPages = new Map()
const URL = 'https://ekrs.ms.gov.pl/web/wyszukiwarka-krs/strona-glowna/'

function search(){
    let range = []
    let numbers = []
    fs.readFile('./search.txt', 'utf8', (e,d) => {
        if(e) {
            console.log(e)
            return
        } else {
            d.split('\n').forEach( a => a ? range.push(a.trim()):'' )
        }
        const start = parseInt(range[0])
        const finish = parseInt(range[1])
        for (let i=start; i<finish; i++){
            let num = start+i
            numbers.push(num.toString().padStart(10,'0'))
        }
    })
    return numbers
}

const numbers = search()

function clickAndSavePdf(numbers){
    const elements = new Map()
    elements.set('label',document.querySelector('iframe').contentWindow.document.body.querySelector('label.input_name b'))
    elements.set('input',document.querySelector('iframe').contentWindow.document.body.querySelector('input#krs'))
    elements.get('label').click()
    elements.get('input').value = numbers.pop()
}

async function crawl(browser,page){
    console.log(`loading:${page.url}`)
    const newPage = browser
    await newPage.goto(page.url,{waitUntil:'networkidle2'})
    await newPage.evaluate(clickAndSavePdf,numbers)
}

(async () => {
    const browser = await puppet.launch({
        headless: false,
        args: []
    })
    const root = {url: URL}
    const pages = await browser.pages()
    await crawl (pages.pop(), root)
    // await browser.close()
})()
