const fs = require('fs')
const express = require('express')
const path = require('path')

const app = express()
// const seneca = Seneca()

app.set('port', 3000)
app.set('views', path.join(__dirname, 'templates'))
app.engine('htm', require('ejs').renderFile)
app.set('view engine', 'htm')
// seneca.use('./plugin')

app.get('/', (req,res) => {
    res.render('index')
})

app.get('/in', (req,res) => {
    token = req.query ? req.query['token'] : ''
    token = token.replace(/["']/g,'')
    tokens.push(token)
    res.redirect(`http://localhost:${port}`)
})

app.get('/get', (req,res) => {
    res.json({token:tokens.pop()})
})

app.listen(app.get('port'), ()=>console.log(`listening on port ${app.get('port')}`))
