var redis = require('redis'),
    connect = require('connect'),
    cluster_lib = require('../../lib/cluster'),
    multiplexer = require('../../lib/multiplexer');

//front and dispatch computer

// unique job id? by Redis?
// compute once a job asked many times
// cache job result
// handle missed response.

var cluster = cluster_lib.createCluster(function() {
    var web = connect.createServer(
        connect.favicon(),

        connect.router(function(app) {
            app.get('/',function(req, res, next) {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                //put task to the queue.
                var job_id = cluster.work('working', 'something_long', ['hello', 'world'],
                    cluster.self(), function(err, resp) {
                    });
                //the answer is back, lets write it.
                cluster.on('id:something_long:' + job_id, function(arg) {
                    res.write(arg[0]);
                    res.end('\n');
                });
            });
        })
        );

    web.listen(1337, "127.0.0.1");

});

