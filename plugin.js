const token = []

module.exports = function(opts){
    this.add('cmd:push_token', (m,r) => {
        token.push(m['token'])
    })
    this.add('cmd:get_token', (m,r) => {
        r(token)
    })
}
