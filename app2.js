const puppet = require('puppeteer')
const express = require('express')
const request = require('request')
const fs = require('fs')
const path = require('path')
const {EventEmitter} = require('events')

const app = express()
const {numbers} = require('./numbers')
const emitter = new EventEmitter()

const crawledPages = new Map()
const URL = 'https://ekrs.ms.gov.pl/web/wyszukiwarka-krs/strona-glowna/'
const DOWNLOAD_PATH = path.resolve(__dirname, 'downloads')
const INTERVAL = 1e3

function slugify(str){
    return str.replace(/[\/:]/g, '_')
}

function mkdirSync(dirPath){
    try{
        dirPath.split('/').reduce((parentPath,dirName)=>{
            const currentPath = parentPath + dirName
            if(!fs.existsSync(currentPath)){
                fs.mkdirSync(currentPath)
            }
            return currentPath + '/'
        }, '')
    } catch(e){
        if(e.code !== 'EEXIST') throw e
    }
}

function waitForFileExists(fp,timeout=15000){
    return new Promise( (resolve,reject) => {
        const dir = path.dirname(fp)
        const base = path.basename(fp)
        const watcher = fs.watch(dir, (et,fn) => {
            if(et==='rename' && fn===base){
                clearTimeout(timer)
                wather.close()
                resolve()
            }
        })
        const timer = setTimeout( e => {
            watcher.close()
            reject(new Error(' [checkFileExists] File does not exist, and was not created during the timeout delay.'))
        }, timeout)
        fs.access(fp, fs.constants.R_OK, e => {
            if(!e){
                clearTimeout(timer)
                watcher.close()
                resolve()
            }
        })
    })
}

function insideBrowser(number,token,sameOrigin=true){
    const elements = new Map()
    const INTERVAL = 1e3

    setTimeout( () => {
        elements.set('label',
            document.querySelector('iframe')
                .contentWindow.document.body
                .querySelector('label.input_name b'))
        elements.get('label').click()
    }, INTERVAL*1)
    setTimeout( () => {
        elements.set('input',
            document.querySelector('iframe')
                .contentWindow.document.body
                .querySelector('input#krs'))
        elements.get('input').value = number}
    , INTERVAL*2 )
    setTimeout( () => {
        elements.set('gtoken',
            document.querySelector('iframe')
                .contentWindow.document.body
                .querySelector('#g-recaptcha-response'))
        elements.get('gtoken').innerHTML = token
    }, INTERVAL*6 )
    setTimeout( () => {
        elements.set('ctoken',
            document.querySelector('iframe')
                .contentWindow.document.body
                .querySelector('#captchaToken'))
        elements.get('ctoken').value = token
    }, INTERVAL*6 )
    setTimeout( () => {
        elements.set('send',
            document.querySelector('iframe')
                .contentWindow.document.body
                .querySelector('#szukaj'))
        elements.get('send').click()
    }, INTERVAL*8)
    // remove the troubled script
    const captcha = document.createElement('iframe', {
        title:"recaptcha challenge",
        src: "https://www.google.com/recaptcha/api2/bframe?hl=en&amp;v=v1566858990656&amp;k=6LepijEUAAAAAIx-XxXOV_b0puYkdP7Niz5gJsC1&amp;cb=a94c83j0nwef",
        name: "c-ohkmxkft270q",
        frameborder: "0",
        scrolling: "no",
        sandbox: "allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox",
        style: "width: 100%; height: 100%;"
    })

    setTimeout( () => {
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

    }, INTERVAL*4 )

    // download pdf
    setTimeout( () => {
        const goto = document.querySelector('iframe')
            .contentWindow.document.body
            .querySelector('#podmiotyGrid a[href]')
        goto.scrollIntoView()
        goto.click()
    },INTERVAL*10)
    setTimeout( () => {
        const pdf = document.querySelector('iframe')
            .contentWindow.document.body
            .querySelector('#pobierzWydrukPelny')
        pdf.target = ''
        pdf.scrollIntoView()
        pdf.click()
    },INTERVAL*13)
}

async function crawl(page, depth=0){
    if (crawledPages.has(page.url)){
        console.log(`Reusing route: ${page.url}`)
        const item = crawledPages.get(page.url)
        return
    } else {
        const {newPage,token,number} = page
        console.log(`loading: ${page.url}`)
        console.log(`search #: ${number}`)
        const client = await newPage.target().createCDPSession()
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: DOWNLOAD_PATH
        })

        await newPage.goto(page.url, {waitUntil: 'networkidle2'})
        await newPage.evaluate(insideBrowser,number,token)

    }
}

(async () => {
    const browser = await puppet.launch({
        headless: false,
        args: ['--enable-logging', '--disable-gpu ', '--disable-software-rasterizer'],
        dumpio: true
    })
    let token = ''
    const root = {url: URL}
    
    const a = setInterval( async () => {
        await new Promise( resolve => {
            request.get({url:'http://localhost:6060/get'}, (e,r,b) => {
                token = JSON.parse(b)['token']
                resolve()
            })
            .on('error', e => console.log('request error', e))
        })
    
        // let newPage
        console.log('token', token)
        try{
            root.number = numbers.pop()
            root.newPage = await browser.newPage()
            root.token = token
            await crawl(root)
        } catch (e) {
            console.log(e)
            emitter.emit('finished', e)
        }

        // await root.newPage.close()

    }, INTERVAL*15)

    setTimeout( () => {
        clearInterval(a)
        emitter.emit('finished')
    }, INTERVAL*60)

    emitter.on('finished', e => {
        console.log('finished', e)
        browser.close()
    })

})()
