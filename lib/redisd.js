var net = require('net'),
    Response = require('./encoder').Response;

var Parser;
// this two libraries are not public, so direct path is used.
// hiredis might not be installed
try {
    Parser = require('../../redis/lib/parser/hiredis').Parser;
} catch (err) {
    if (exports.debug_mode) {
        console.warn('hiredis parser not installed.');
    }
    Parser = require('../../redis/lib/parser/javascript').Parser;
}

var createServer = function(onCommand) {
    var server = net.createServer({}, function(connection) {
        var parser = new Parser();
        var response = new Response(connection);
        parser.on('error', function(err) {
            console.log(err);
        });
        // Parser was build for clients, not servers.
        parser.on('reply', function(reply) {
            onCommand.call(response, reply);
        });
        connection.on('data', function(data) {
            parser.execute(data);
        });
    });
    return server;
};

exports.createServer = createServer;
