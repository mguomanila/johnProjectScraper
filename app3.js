require('dotenv-safe').config({sample:'.env'})
const puppeteer = require('puppeteer')
const express = require('express')
const request = require('request')
const fs = require('fs')
const path = require('path')
const {EventEmitter} = require('events') 
const {parsePdf} = require('./pdf_parser')
const {mkdirSync,waitForFileExists,browse1,browse2} = require('./utility')

const app = express()
const event = new EventEmitter()
const {numbers,modifyFile:modifyNumbers} = require('./numbers1')

const OUT_DIR1 = process.env.OUT_DIR1
const OUT_DIR2 = process.env.OUT_DIR2
const DOWNLOAD_PATH1 = path.resolve(__dirname, OUT_DIR1)
const DOWNLOAD_PATH2 = path.resolve(__dirname, OUT_DIR2)
const URL = process.env.URL
const local_url = process.env.local_url
const timeout = process.env.timeout

  
async function crawl1(browser, page){
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
        await newPage.evaluate(browse1, page)
    }catch(e){
        console.log(e)
        newPage.close()
    }
    await newPage.close()
    // event.emit('finished')
}

async function crawl2(browser, page){
    console.log(`Loading: ${page.url}`)
    console.log(`using #${page.number}`)
    console.log('token: ', page.token)
    const newPage = await browser.newPage()
    const client = await newPage.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: DOWNLOAD_PATH2
    })
    await newPage.goto(page.url, {waitUntil: 'networkidle2'})
    try{
        await newPage.evaluate(browse2, page)
    }catch(e){
        console.log(e)
        newPage.close()
    }
    await newPage.close()
    // event.emit('finished')
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

    event.on('clearInterval', ()=>{
        clearInterval(intervalId)
    })
    
    mkdirSync(OUT_DIR1) // create output dir if it doesn't exist
    mkdirSync(OUT_DIR2)
    const browser = await puppeteer.launch({
        // headless: false,
        args: ['--enable-logging', '--disable-gpu ', '--disable-software-rasterizer', 
        //'--disable-web-security', 
        '--user-data-dir=./chrome'
    ],
        dumpio: true
    })
    
    let token = '', tokens = []
    const root = {url: URL}
    let interval_id
    let counter = 0

    event.on('tokens1', async(token,n)=>{
        await Promise.all([
            root.token = token,
            root.number = n,
            event.emit('numbers_change', numbers)
            // modifyNumbers(numbers)
        ])
        try{
            await crawl1(browser, root)
        }catch(e){
            console.log(e)
            event.emit('clearInterval')
            event.emit('finished')
        }  
    })
    event.on('tokens2', async(token,n)=>{
        await Promise.all([
            root.token = token,
            root.number = n
            // event.emit('numbers_change', numbers)
            // modifyNumbers(numbers)
        ])
        try{
            await crawl2(browser, root)
        }catch(e){
            console.log(e)
            event.emit('clearInterval')
            event.emit('finished')
        }  
    })
    let count=0
    let number
    var intervalId = setInterval( () => {
        request.get({url: local_url}, (e,r,b)=>{
            token = JSON.parse(b)['token']
            if(!!token && !count) {
                // tokens.push(token)
                number = numbers.pop()
                event.emit('tokens1',token, number)
                count++
            }else if(!!token && !!count){
                event.emit('tokens2',token, number)
                count=0
            }
        })
    },timeout*1)

})()