var events = require('events'),
    util = require('util'),
    redis = require('redis'),
    redisd = require('./redisd');

var REDIS = 'localhost:6379';

var Cluster = function(_port, _address) {
    this._clients = {};
    //Use JSON, tnetstrings or any serialization
    this.serialize = JSON.stringify;
    this.unserialize = JSON.parse;
    this.worker = new events.EventEmitter();
    this.queues = [];
    this._id = 0;
    var that = this;
    this.server = redisd.createServer(function(command) {
        var id = command[0];
        console.log('command', command);
        if(command[0] == 'info') {
            this.encode('redis_version:2.4.5');
        } else {
            that.emit('id:' + id, command);
            this.singleline('OK');
        }
    });
    this.server.listen();
    this.client(REDIS);//cold warm
};

util.inherits(Cluster, events.EventEmitter);

Cluster.prototype.self = function() {
    var s = this.server.address();
    return [s.address, s.port].join(':');
};

Cluster.prototype.unique_id = function() {
    //TODO a job for UUID?
    var s = this.server.address();
    return [s.address, s.port, this._id++].join(':');
};

Cluster.prototype.client = function(key) {//lazy clients
    if(this._clients[key] == undefined) {
        console.log('new client to', key);
        var kv = key.split(':');
        this._clients[key] = redis.createClient(kv[1], kv[0]);
        var that = this;
        this._clients[key].on('error', function(error) {
            console.warn(error);
            that._clients[key].end();
            delete that._clients[key];
            //[FIXME] disconnecting client is a drama.
        })
    }
    return this._clients[key];
};

Cluster.prototype.call = function(who, what, arg, callback) {
    this.client(who).send_command(what, [this.serialize(arg)], callback);
};

Cluster.prototype.work = function(queue, action, args, respond_to, callback) {
    this.client(REDIS).rpush(queue, this.serialize([action, args, respond_to]), callback);
};

Cluster.prototype.asyncCall = function(who, what, arg, callback) {
    //response node is provided, simple direct response should be OK or something like that.
    this.redis.send_command(what, [this.serialize([arg, this.self()])],
            function(err, resp) {
                if(err) console.warn(err);
            });
// register the callback with its id
// callback can be call more than one time
};

Cluster.prototype.work_loop = function() {
    //[TODO] Raise error if no loop.
    var w = this;
    this.client(REDIS).lpop(this.queues, function(err, resp) {
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
    var cluster = new Cluster();
    return cluster;
}
