var cluster_lib = require('../../lib/cluster');

//Working computer

var cluster = cluster_lib.createCluster();
cluster.queues.push('working');

cluster.worker.on('something_long', function(args, respond_to, job_id) {
    //got a new task to do, lets answer
    cluster.answer(respond_to, 'something_long', job_id, ['Hello world!'],
        function(err, resp) { });
});

cluster.work_loop();
console.log('Worker is started', cluster.self());
