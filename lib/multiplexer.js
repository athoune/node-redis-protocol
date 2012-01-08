var events = require('events'),
    redisd = require('./redisd');

/*
 * Commands :
 *  * host
 *  * port
 *  * id
 *  * args…
 * */

var server = redisd.createServer(function(command) {
    var id = command.pop();
    this.emit('id:' + id, command);
});

