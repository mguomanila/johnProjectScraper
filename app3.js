const puppet = require('puppeteer')
const express = require('express')
const request = require('request')
const fs = require('fs')
const path = require('path')
const {EventEmitter} = require('events') 

const app = express()
const {numbers} = require('./numbers1')
const event = new EventEmitter()

const URL = 'https://ekrs.ms.gov.pl/web/wyszukiwarka-krs/strona-glowna/'
const DOWNLOAD_PATH = path.resolve(__dirname, 'downloads')
const INTERVAL = 1e3
const local_url = 'http://localhost:6060/get'

function mkdirSync(dirPath) {
    try {
      dirPath.split('/').reduce((parentPath, dirName) => {
        const currentPath = parentPath + dirName;
        if (!fs.existsSync(currentPath)) {
          fs.mkdirSync(currentPath);
        }
        return currentPath + '/';
      }, '');
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
}
  
async function findPDFAndDownload(page){
    await new Promise (resolve => {
        document.querySelector('iframe')
        .contentWindow.document.body
        .querySelector('label.input_name b')
        .click()
    })
    await new Promise( resolve => {
        document.querySelector('iframe')
        .contentWindow.document.body
        .querySelector('input#krs')
        .value = number
    })
    await new Promise( resolve => {
        document.querySelector('iframe')
        .contentWindow.document.body
        .querySelector('#g-recaptcha-response')
        .innerHTML = token
    })
    await new Promise( resolve => {
        document.querySelector('iframe')
        .contentWindow.document.body
        .querySelector('#szukaj')
        .click()
    })
    const captcha = document.createElement('iframe', {
        title:"recaptcha challenge",
        src: "https://www.google.com/recaptcha/api2/bframe?hl=en&amp;v=v1566858990656&amp;k=6LepijEUAAAAAIx-XxXOV_b0puYkdP7Niz5gJsC1&amp;cb=a94c83j0nwef",
        name: "c-ohkmxkft270q",
        frameborder: "0",
        scrolling: "no",
        sandbox: "allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox",
        style: "width: 100%; height: 100%;"
    })
    const scripts = document.querySelector('iframe')
        .contentWindow.document.body
        .querySelectorAll('iframe')
    const elem1 = scripts[scripts.length-1]
    const elem2 = scripts[0]
    const parent2 = elem2.parentNode
    parent2.removeChild(elem)
    parent2.appendChild(captcha)
    const parent1 = elem1.parentNode
    parent1.removeChild(elem1)
    await new Promise( resolve => {
        const goto = document.querySelector('iframe')
            .contentWindow.document.body
            .querySelector('#podmiotyGrid a[href]')
        goto.scrollIntoView()
        goto.click()
    })
    await new Promise( resolve => {
        const pdf = document.querySelector('iframe')
            .contentWindow.document.body
            .querySelector('#pobierzWydrukPelny')
        pdf.target = ''
        pdf.scrollIntoView()
        pdf.click()
    })
}

async function crawl(browser, page){
    console.log(`Loading: ${page.url}`)
    const newPage = await browser.newPage()
    const client = await newPage.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: DOWNLOAD_PATH
    })
    await newPage.goto(page.url, {waitUntil: 'networkidle2'})
    await newPage.evaluate(findPDFAndDownload, page)
    await newPage.close()
}

(async() => {
    mkdirSync(OUT_DIR) // create output dir if it doesn't exist
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--enable-logging', '--disable-gpu ', '--disable-software-rasterizer'],
        dumpio: true
    })
    let token = ''
    const root = {url: URL}
    (await new Promise( resolve => {
        request.get({url: local_url}, (e,r,b)=>{
            token = JSON.parse(b)['token']
            resolve(token)
        })
    })).catch(e => event.emit('finished', e))
    root.token = token
    root.number = numbers.pop()
    try{
        await crawl(browser, root)
    } catch(e){
        event.emit('finished', e)
    }
    
    event.on('finished', e => {
        if(e) console.log(e)
        browser.close()
    })

})