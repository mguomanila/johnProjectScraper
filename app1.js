const Seneca = require('seneca')
const puppet = require('puppeteer')
const express = require('express')
const request = require('request')
const fs = require('fs')
const {EventEmitter} = require('events')

const app = express()
const {numbers} = require('./numbers')
const emitter = new EventEmitter()

const crawledPages = new Map()
const URL = 'https://ekrs.ms.gov.pl/web/wyszukiwarka-krs/strona-glowna/'

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

function insideBrowser(number,token,sameOrigin=true){
    const elements = new Map()
    const timeInterval = 1e3

    // elements.set('captcha',
    //     document.querySelector('iframe')
    //         .contentWindow.document.body
    //         .querySelector('#recaptcha-anchor'))
    setTimeout( () => {
        elements.set('label',
            document.querySelector('iframe')
                .contentWindow.document.body
                .querySelector('label.input_name b'))
        elements.get('label').click()
    }, timeInterval*1)
    setTimeout( () => {
        elements.set('input',
            document.querySelector('iframe')
                .contentWindow.document.body
                .querySelector('input#krs'))
        elements.get('input').value = '0000066488'}
    , timeInterval*2 )
    setTimeout( () => {
        elements.set('gtoken',
            document.querySelector('iframe')
                .contentWindow.document.body
                .querySelector('#g-recaptcha-response'))
        elements.get('gtoken').innerHTML = token
    }, timeInterval*6 )
    setTimeout( () => {
        elements.set('ctoken',
            document.querySelector('iframe')
                .contentWindow.document.body
                .querySelector('#captchaToken'))
        elements.get('ctoken').value = token
    }, timeInterval*6 )
    // setTimeout( () => elements.get('captcha').click(), timeInterval*6 )
    setTimeout( () => {
        elements.set('send',
            document.querySelector('iframe')
                .contentWindow.document.body
                .querySelector('#szukaj'))
        // elements.get('send').click()
        return elements.get('send')
    }, timeInterval*8)
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

    }, timeInterval*4 )

    // download pdf
    
}

async function crawl(browser, page, token, captcha, depth=0){
    if (crawledPages.has(page.url)){
        console.log(`Reusing route: ${page.url}`)
        const item = crawledPages.get(page.url)
        return
    } else {
        console.log(`loading: ${page.url}`)
        const newPage = browser
        await newPage.goto(page.url, {waitUntil: 'networkidle2'})
        const elem = newPage.evaluate(insideBrowser,numbers.pop(),token,captcha)
        await newPage.waitForSelector('#szukaj')
        await newPage.click('#szukaj')
        // elem.click()
        await newPage.waitForSelector('#podmiotyGrid a[href]')
        await newPage.click('#podmiotyGrid a[href]')
        await newPage.waitForSelector('#pobierzWydrukPelny')
        await newPage._client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: './'
        })
        await newPage.click('#pobierzWydrukPelny')
    }
}

;(async () => {
    let token = ''
    const root = {url: URL}
    const browser = await puppet.launch({
        headless: false,
        args: ['--enable-logging']
    })
    const pages = await browser.pages()
    await request.get({url:'http://localhost:6060/get'}, (e,r,b)=>{
        token = JSON.parse(b)['token']
        emitter.emit('foo', token)
    })
    emitter.on('foo', token => {
        console.log('token', token)
        const page = crawl (pages[0], root, token)
        // emitter.emit('pdf', page)
    })
    // emitter.on('pdf', page => {
    //     page.evaluate( () => {
    //         goto = document.querySelector('#podmiotyGrid a[href]')
    //         goto.click()
    //     })
    //     emitter.emit('download', page)
    // })
    // emitter.on('download', page => {
        // page._client.send('Page.setDownloadBehavior', {
        //     behavior: 'allow',
        //     downloadPath: './'
        // })
    //     page.evaluate( () => {
    //         download = document.querySelector('#pobierzWydrukPelny')
    //         download.click()
    //     })

        // const filename = /.*\.pdf/i
        // page.on('response', r =>{
        //     if(r._headers['content-disposition'] ===`attachment; filename=${filename}`)
        // })
    // })
    //await browser.close()
})()
