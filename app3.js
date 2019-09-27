require('dotenv-safe').config({sample:'.env'})
const fs = require('fs')
const {resolve} = require('path')
const express = require('express')
const request = require('request')
const puppeteer = require('puppeteer')
const {mkdirSync,waitForFileExists,browse1,browse2,event,logger} = require('./utility')

const app = express()
const search = process.env.search + '.txt'
let numbers = require('./numbers1')(search)

const OUT_DIR1 = process.env.OUT_DIR1
const OUT_DIR2 = process.env.OUT_DIR2
const DOWNLOAD_PATH1 = resolve(__dirname, OUT_DIR1)
const DOWNLOAD_PATH2 = resolve(__dirname, OUT_DIR2)
const URL = process.env.URL
const local_url = process.env.local_url
const timeout = process.env.timeout

mkdirSync([OUT_DIR1,OUT_DIR2])
  
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
        logger.write2(e)
    }finally{
        await newPage.close()
    }
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
        logger.write2(e)
    }finally{
        await newPage.close()
    }
}

(async() => {

    const browser = await puppeteer.launch({
        // headless: false,
        args: [
            // '--enable-logging', 
            `--proxy-server="https://${proxy-ip}:${proxy-port}"`,
            '--disable-gpu ', 
            '--disable-software-rasterizer', 
            //'--disable-web-security', 
            // '--user-data-dir=./chrome'
    ],
        dumpio: true
    })
    
    let token = ''
    const root = {url: URL}
    numbers = await numbers

    event.on('tokens', async(token,n,count)=>{
        root.token = token
        root.number = n
        if(!count) event.emit('numbers', numbers, search)
        try{
            if(!count)
                await crawl1(browser, root)
            else 
                await crawl2(browser, root)
        }catch(e){
            logger.write2(e)
            event.emit('clearInterval', intervalId)
            event.emit('finished')
        }  
    })

    let count=0
    let number
    var intervalId = setInterval( () => {
        request.get({url: local_url}, (e,r,b)=>{
            token = JSON.parse(b)['token']
            if(!!token && !count) {
                number = numbers.pop()
                event.emit('tokens',token, number, count)
                count++
            }else if(!!token && !!count){
                event.emit('tokens',token, number, count)
                count=0
            }
        })
    },timeout*1)

})()
