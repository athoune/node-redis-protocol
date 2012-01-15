var redis = require('redis'),
    http = require('http'),
    cluster_lib = require('../../lib/cluster'),
    multiplexer = require('../../lib/multiplexer');

//front and dispatch computer

var cluster = cluster_lib.createCluster();

var web = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  var job_id = cluster.work('working', 'something long', ['hello', 'world'],
      cluster.self(), function(err, resp) {
    //console.log('async job sent', resp);
  });
  cluster.on('id:something long:' + job_id, function() {
      //console.log('call back', arguments);
      res.end('Hello World\n');
  });
});

web.listen(1337, "127.0.0.1");

