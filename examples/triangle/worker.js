var cluster_lib = require('../../lib/cluster');

//Working computer

var cluster = cluster_lib.createCluster();
cluster.queues.push('working');

cluster.worker.on('something long', function(args, respond_to) {
    console.log('worker got some args', args);
});

cluster.work_loop();
console.log('Worker is started', cluster.self());
