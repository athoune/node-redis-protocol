var redis = require('redis'),
    cluster_lib = require('../../lib/cluster'),
    multiplexer = require('../../lib/multiplexer');

//front and dispatch computer

var cluster = cluster_lib.createCluster();

cluster.work('working', 'something long', ['hello', 'world'], cluster.self(), function(err, resp) {
    console.log('async job sent', resp);
});

