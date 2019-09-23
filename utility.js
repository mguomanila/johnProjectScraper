const path = require('path')
const fs = require('fs')
const {modifyFile:modifyNumbers} = require('./numbers1')

exports = module.exports = {}

function mkdirSync(dirPath) {
    function a(dirPath){
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
    if(typeof dirPath === 'object'){
        dirPath.forEach( a )
    } else {
        a(dirPath)
    }

}

/**
 * From @xprudhomme.
 * Check if file exists, watching containing directory meanwhile.
 * Resolve if the file exists, or if the file is created before the timeout
 * occurs.
 * @param {string} filePath
 * @param {integer} timeout
 * @returns {!Promise<undefined>} Resolves when file has been created. Rejects
 *     if timeout is reached.
 */
function waitForFileExists(filePath, timeout=15000) {
    return new Promise((resolve, reject) => {
      const dir = path.dirname(filePath);
      const basename = path.basename(filePath);
  
      const watcher = fs.watch(dir, (eventType, filename) => {
        if (eventType === 'rename' && filename === basename) {
          clearTimeout(timer);
          watcher.close();
          resolve();
        }
      });
  
      const timer = setTimeout(() => {
        watcher.close();
        reject(new Error(' [checkFileExists] File does not exist, and was not created during the timeout delay.'));
      }, timeout);
  
      fs.access(filePath, fs.constants.R_OK, err =>  {
        if (!err) {
          clearTimeout(timer);
          watcher.close();
          resolve();
        }
      });
    });
}

async function findPDFAndDownload1(page){
    const timeout = 1e3
    await new Promise( resolve => {
        setTimeout( () => resolve(), timeout*6 )
    })
    await new Promise (resolve => {
        document.querySelector('iframe')
        .contentWindow.document.body
        // .querySelector('label.input_name b')
        .querySelector('#rejestrPrzedsiebiorcy')
        .click()
        resolve()
    })
    await new Promise( resolve => {
        document.querySelector('iframe')
        .contentWindow.document.body
        .querySelector('input#krs')
        // .value = '0000586006'
        .value = page.number
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
        setTimeout( () => resolve(), timeout*6 )
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

async function findPDFAndDownload2(page){
    const timeout = 1e3
    await new Promise( resolve => {
        setTimeout( () => resolve(), timeout*4 )
    })
    await new Promise (resolve => {
        document.querySelector('iframe')
        .contentWindow.document.body
        // .querySelector('label.input_name b')
        .querySelector('#rejestrStowarzyszenia')
        .click()
        resolve()
    })
    await new Promise( resolve => {
        document.querySelector('iframe')
        .contentWindow.document.body
        .querySelector('input#krs')
        // .value = '0000586006'
        // .value = '0000066488'
        .value = page.number
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
        setTimeout( () => resolve(), timeout*6 )
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

function Event(){
    const {EventEmitter} = require('events') 
    const event = new EventEmitter()
    event.on('finished', e => {
        if(e) console.log('an error occured',e)
        browser.close()
    })
    event.on('numbers', (n,f) => {
        modifyNumbers(f,n)
    })
    event.on('clearInterval', id => {
        clearInterval(id)
    })
    return event
}

function logging(){
    const filepath = path.resolve(__dirname,'log.txt')
    let logger
    if(!fs.existsSync(filepath)){
        fs.writeFileSync(filepath,'')
    }
    logger = fs.createWriteStream(filepath,{
        flags: 'a+',
        encoding: 'utf8',
        fd: null,
        mode: 0o666,
        autoClose: true
    })
    logger.write2 = function(a){
        logger.write(a+'\n')
    }
    return logger
}

// choose your utility
exports.mkdirSync = mkdirSync
exports.waitForFileExists = waitForFileExists
exports.browse1 = findPDFAndDownload1
exports.browse2 = findPDFAndDownload2
exports.event = Event()
exports.logger = logging()