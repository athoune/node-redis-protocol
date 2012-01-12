var events = require('events'),
    redis = require('redis');

var cpt = 0;

var Cluster = function(port, _address) {
    var address = _address || 'localhost';
    this.redis = redis.createClient(port, address);
    //Use JSON, tnetstrings or any serialization
    this.serialize = JSON.stringify;
    this.unserialize = JSON.parse;
    this.worker = new events.EventEmitter();
    this.queues = [];
};

Cluster.prototype.self = function() {
    //TODO host and port
    return process.pid + ':' + cpt++;
};

Cluster.prototype.call = function(what, arg, callback) {
    this.redis.send_command(what, this.serialize(arg), callback);
};

Cluster.prototype.work = function(queue, action, args, respond_to, callback) {
    this.redis.rpush(queue, this.serialize([action, args, respond_to]), callback);
};

Cluster.prototype.asyncCall = function(what, arg, callback) {
    //response node is provided, simple direct response should be OK or something like that.
    this.redis.send_command(what, [this.serialize([arg, this.self()])],
            function(err, resp) {
                if(err) console.warn(err);
            });
// register the callback with its id
// callback can be call more than one time
};

Cluster.prototype.work_loop = function() {
    var w = this;
    this.redis.lpop(this.queues, function(err, resp) {
        if (resp) {
            var args = JSON.parse(resp);
            var f = args.shift();
            w.worker.emit(f, args[0], args[1]);
        }
        if (resp) {
            process.nextTick(function() {
                w.work_loop();
            });
        } else {
            //the queue is empty, don't flood redis
            setTimeout(function() {
                w.work_loop();
            }, 1000);
        }
    });

};

exports.createCluster = function() {
    return new Cluster();
}
