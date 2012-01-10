var redis = require('redis'),
    client = require('./lib/client'),
    worker_lib = require('./lib/worker'),
    multiplexer = require('./lib/multiplexer');

//Working computer

var worker = new worker_lib.Worker('working');
worker.loop();

worker.on('something long', function(args, respond_to) {
    console.log('worker got some args', args);
});


//front and dispatch computer
var node = multiplexer.server;
node.listen(4227);

var queue = client.createClient();

queue.work('working', 'something long', ['hello', 'world'], ['localhost', 4227, 'jobs done'], function(err, resp) {
    console.log('async job sent', resp);
});

