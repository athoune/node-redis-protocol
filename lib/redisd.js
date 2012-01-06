var net = require('net'),
    encoder = require('./encoder');

var Parser;
// hiredis might not be installed
try {
    Parser = require('../node_modules/redis/lib/parser/hiredis').Parser;
} catch (err) {
    if (exports.debug_mode) {
        console.warn('hiredis parser not installed.');
    }
    Parser = require('../node_modules/redis/lib/parser/javascript').Parser;
}

var server = net.createServer({}, function(c) {
    var parser = new Parser();
    parser.on('error', function(err) {
        console.log(err);
    });
    parser.on('reply', function(reply) { // Parser was build for clients, not servers.
        encoder.encode(c, ['pim', 'pam']);
        console.log('query', reply);
    });
    c.on('data', function(data) {
        parser.execute(data);
    });
});

server.listen(6379, function() {
    console.log('fake redis started');
});
