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

function insideBrowser(number,token,captcha,sameOrigin=true){
    const elements = new Map()
    const timeInterval = 1e3

    const scripts = document.querySelector('iframe')
        .contentWindow.document.body
        .querySelectorAll('iframe')
    const elem = scripts[scripts.length-1]
    const parent = elem.parentNode

    elements.set('label',
        document.querySelector('iframe')
            .contentWindow.document.body
            .querySelector('label.input_name b'))
    elements.set('input',
        document.querySelector('iframe')
            .contentWindow.document.body
            .querySelector('input#krs'))
    elements.set('gtoken',
        document.querySelector('iframe')
            .contentWindow.document.body
            .querySelector('#g-recaptcha-response'))
    elements.set('ctoken',
        document.querySelector('iframe')
            .contentWindow.document.body
            .querySelector('#captchaToken'))
    // elements.set('captcha',
    //     document.querySelector('iframe')
    //         .contentWindow.document.body
    //         .querySelector('#recaptcha-anchor'))
    elements.set('send',
        document.querySelector('iframe')
            .contentWindow.document.body
            .querySelector('#szukaj'))
    setTimeout( () => elements.get('label').click(), timeInterval*1 )
    setTimeout( () => elements.get('input').value = number, timeInterval*2 )
    setTimeout( () => elements.get('gtoken').innerHTML = token, timeInterval*3 )
    setTimeout( () => elements.get('ctoken').value = token, timeInterval*4 )
    // setTimeout( () => elements.get('captcha').click(), timeInterval*6 )
    // setTimeout( () => elements.get('send').click(), timeInterval*3)
    // remove the troubled script
    setTimeout( () => {
        parent.removeChild(elem)
        parent.appendChild(captcha)
    }, timeInterval*5 )
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
        await newPage.evaluate(insideBrowser,numbers.pop(),token,captcha)
    }
}

(async () => {
    let token = ''
    const root = {url: URL}
    const browser = await puppet.launch({
        headless: false,
        args: []
    })
    const pages = await browser.pages()
    await request.get({url:'http://localhost:6060/get'}, (e,r,b)=>{
        token = JSON.parse(b)['token']
        captcha = 
        emitter.emit('foo', token, captcha)
    })
    emitter.on('foo', (token,captcha) => {
        console.log('token', token)
        crawl (pages[0], root, token, captcha)
    })
    //await browser.close()
})()
