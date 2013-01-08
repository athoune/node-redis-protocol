var net = require('net'),
    path = require('path'),
    Response = require('./encoder').Response;

require('redis');
var root = path.dirname(require.resolve('redis'));
var Parser;
// this two libraries are not public, so direct path is used.
// hiredis might not be installed
try {
    Parser = require(root + '/lib/parser/hiredis').Parser;
} catch (err) {
    if (exports.debug_mode) {
        console.warn('hiredis parser not installed.');
    }
    Parser = require(root + '/lib/parser/javascript').Parser;
}

var createServer = function(onCommand) {
    var server = net.createServer({}, function(connection) {
        var parser = new Parser({debug_mode:false});
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
