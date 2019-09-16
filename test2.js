var sys = require('sys');
var exec = require('child_process').exec;
var cmd = 'whoami';
var username;

var child = exec(cmd, function(error, stdout, stderr, callback) {
    username = stdout.replace('\r\n','');
    callback(username)
});

child();

console.log( username );
