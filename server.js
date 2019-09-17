const Seneca = require('seneca')
const Express = require('express')
const path = require('path')

const app = Express()
const seneca = Seneca()
const tokens = []
seneca.use('./test_plugin2')
seneca.quiet()

const port = 6060
app.set('views', path.join(__dirname, 'template'))
app.engine('htm', require('ejs').renderFile)
app.set('view engine', 'htm')

app.get('/', (req,res) => {
    res.render('index')
})

app.get('/in', (req,res) => {
    token = req.query ? req.query['token'] : ''
    token = token.replace(/["']/g,'')
    tokens.push(token)
    //console.log(tokens[tokens.length?tokens.length-1:tokens.length])
    //console.log(req.body,req.query)
    res.redirect(`http://localhost:${port}`)
})

app.get('/get', (req,res) => {
    res.json({token:tokens.pop()})
})

app.listen(port, e => console.log(`listening on port ${port}`))

seneca.act({role:'token',cmd:'push_token',token:tokens.pop()}, (e,r) => {
        if(e){
            console.log(e)
            return
        }
        else {
//             console.log(`listening @port ${port}`)
            console.log(r)
        }
    })

seneca.add({role:'token',cmd:'get_token'}, (m,r) => {
    r(this.token)
})
    
// seneca.listen({port:port,pin:{role:'token'}})
