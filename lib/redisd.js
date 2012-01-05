
var parsers = [];

// hiredis might not be installed
try {
    require('../node_modules/redis/lib/parser/hiredis');
    parsers.push(require('../node_modules/redis/lib/parser/hiredis'));
} catch (err) {
    if (exports.debug_mode) {
        console.warn('hiredis parser not installed.');
    }
}

parsers.push(require('../node_modules/redis/lib/parser/javascript'));

var parser = new parsers[0].Parser();

parser.on('error', function(err) {
    console.log(err);
});

parser.on('reply', function(reply) {
    console.log('reply', reply);
});


parser.execute(
        new Buffer('*3\r\n$3\r\nSET\r\n$5\r\nmykey\r\n$7\r\nmyvalue\r\n'));
