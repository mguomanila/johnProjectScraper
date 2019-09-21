const puppeteer = require('puppeteer')
const express = require('express')
const request = require('request')
const fs = require('fs')
const path = require('path')
const {EventEmitter} = require('events') 

const app = express()
const {numbers,modifyFile} = require('./numbers1')
const event = new EventEmitter()

const URL = 'https://ekrs.ms.gov.pl/web/wyszukiwarka-krs/strona-glowna/'
const timeout = 1e3
const local_url = 'http://localhost:6060/get'
const OUT_DIR1 = process.env.OUT_DIR || `downloads3`
const OUT_DIR2 = process.env.OUT_DIR || `downloads4`
const DOWNLOAD_PATH1 = path.resolve(__dirname, OUT_DIR1)
const DOWNLOAD_PATH2 = path.resolve(__dirname, OUT_DIR2)

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
    const timeout = 1e3
    await new Promise (resolve => {
        document.querySelector('iframe')
        .contentWindow.document.body
        .querySelector('label.input_name b')
        .click()
        resolve()
    })
    await new Promise( resolve => {
        document.querySelector('iframe')
        .contentWindow.document.body
        .querySelector('input#krs')
        .value = '0000066488'
        resolve()
    })

    let captcha
    let scripts
    
    captcha = document.createElement('iframe', {
        title:"recaptcha challenge",
        src: "https://www.google.com/recaptcha/api2/bframe?hl=en&amp;v=v1566858990656&amp;k=6LepijEUAAAAAIx-XxXOV_b0puYkdP7Niz5gJsC1&amp;cb=a94c83j0nwef",
        name: "c-ohkmxkft270q",
        frameborder: "0",
        scrolling: "no",
        sandbox: "allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox",
        style: "width: 100%; height: 100%;"
    })

    await new Promise( resolve => {
        setTimeout( () => resolve(), timeout*4 )
    })
        
    await new Promise( resolve => {
        scripts = document.querySelector('iframe')
            .contentWindow.document.body
            .querySelectorAll('iframe')
        resolve()
    })

    const elem1 = scripts[0]
    const elem2 = scripts[1]
    // const parent1 = elem1.parentNode
    // const parent2 = elem2.parentNode
    // parent1.removeChild(elem1)
    // parent1.appendChild(captcha)
    // parent2.removeChild(elem2)
    const parent = scripts[0].parentNode
    parent.removeChild(scripts[0])
    parent.appendChild(captcha)
    scripts[1].parentNode.removeChild(scripts[1])
    
    await new Promise( resolve => {
        document.querySelector('iframe')
        .contentWindow.document.body
        .querySelector('#g-recaptcha-response')
        .innerHTML = page.token
        resolve()
    })
    await new Promise( resolve => {
        document.querySelector('iframe')
        .contentWindow.document.body
        .querySelector('#captchaToken')
        .value = page.token
        resolve()
    })
    await new Promise( resolve => {
        const button = document.querySelector('iframe')
        .contentWindow.document.body
        .querySelector('#szukaj')
        button.scrollIntoView()
        button.click()
        resolve()
    })

    await new Promise( resolve => {
        setTimeout( () => resolve(), timeout*4 )
    })
    
    await new Promise( resolve => {
        const goto = document.querySelector('iframe')
            .contentWindow.document.body
            .querySelector('#podmiotyGrid a[href]')
        goto.scrollIntoView()
        goto.click()
        resolve()
    })

    await new Promise( resolve => {
        setTimeout( () => resolve(), timeout*4 )
    })

    await new Promise( resolve => {
        const pdf = document.querySelector('iframe')
            .contentWindow.document.body
            .querySelector('#pobierzWydrukPelny')
        pdf.target = ''
        pdf.scrollIntoView()
        pdf.click()
        setTimeout( () => resolve(), timeout*5 )
    })
}

async function crawl(browser, page){
    console.log(`Loading: ${page.url}`)
    console.log(`using #${page.number}`)
    console.log('token: ', page.token)
    const newPage = await browser.newPage()
    const client = await newPage.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: DOWNLOAD_PATH1
    })
    await newPage.goto(page.url, {waitUntil: 'networkidle2'})
    try{
        await newPage.evaluate(findPDFAndDownload, page)
    }catch(e){
        console.log(e)
        newPage.close()
    }
    await newPage.close()
    // event.emit('finished')
}

function modifyNumbers(n){
    modifyFile(n)
}

(async() => {
    event.on('finished', e => {
        if(e) console.log('an error occured',e)
        browser.close()
    })
    event.on('numbers_change', n => {
        modifyNumbers(n)
    })
    event.on('timeout', ()=>{
        clearInterval(interval_id)
    })
    mkdirSync(OUT_DIR1) // create output dir if it doesn't exist
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--enable-logging', '--disable-gpu ', '--disable-software-rasterizer'],
        dumpio: true
    })
    
    let token = '', tokens = []
    const root = {url: URL}
    let interval_id
    let counter = 0

    event.on('tokens', async(token)=>{
        await Promise.all([
            root.token = token,
            root.number = numbers.pop(),
            event.emit('numbers_change', numbers)
            // modifyNumbers(numbers)
        ])
        await crawl(browser, root)
    })

    setInterval( () => {
        request.get({url: local_url}, (e,r,b)=>{
            token = JSON.parse(b)['token']
            if(!!token) {
                // tokens.push(token)
                event.emit('tokens',token)
            }
        })
    },timeout)

})()