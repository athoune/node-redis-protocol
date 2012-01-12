var redis = require('redis'),
    cluster_lib = require('../../lib/cluster'),
    multiplexer = require('../../lib/multiplexer');

//front and dispatch computer

var cluster = cluster_lib.createCluster();

var chrono = Date.now();
cluster.work('working', 'something long', ['hello', 'world'], cluster.self(), function(err, resp) {
    console.log('async job sent', resp);
    console.log('sent', Date.now() - chrono);
});

cluster.on('id:something long', function() {
    console.log('call back', arguments);
    console.log('chrono', Date.now() - chrono);
});
