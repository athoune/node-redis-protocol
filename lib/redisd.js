var net = require('net'),
    Response = require('./encoder').Response;

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

var createServer = function(onCommand) {
    return net.createServer({}, function(connection) {
        var parser = new Parser();
        var response = new Response(connection);
        parser.on('error', function(err) {
            console.log(err);
        });
        parser.on('reply', function(reply) { // Parser was build for clients, not servers.
            onCommand.call(response, reply);
        });
        connection.on('data', function(data) {
            parser.execute(data);
        });
    });
};

exports.createServer = createServer;
