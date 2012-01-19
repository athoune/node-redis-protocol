var events = require('events'),
    util = require('util'),
    redis = require('redis'),
    redisd = require('./redisd');

var REDIS = 'localhost:6379';

var Cluster = function(cb) {
    this._clients = {};
    //Use JSON, tnetstrings or any serialization
    this.serialize = JSON.stringify;
    this.unserialize = JSON.parse;
    this.worker = new events.EventEmitter();
    this.queues = [];
    this._id = 0;
    var that = this;
    this.server = redisd.createServer(function(command) {
        if (command[0] == 'info') {
            this.encode('redis_version:2.4.5');
        } else {
            var cmd = command[0];
            var pid = command[1];
            var values = command[2];
            that.emit('id:' + cmd + ':' + pid, JSON.parse(values));
            this.singleline('OK');
        }
    });
    this.server.listen();
    var that = this;
    this.server_id(function(id) {
        that._server_id = id;
        that._server_name_id = 'server.' + id + '.id';
        that.client(REDIS).get(this._server_name_id, function(err, msg) {
            if (msg === null) {
                that._id = 0;
            } else {
                that._id = parseInt(msg, 10);
            }
            cb.call(that);
        });
    });
    this.client(REDIS);//cold warm
};

util.inherits(Cluster, events.EventEmitter);

Cluster.prototype.server_id = function(cb) {
    this.client(REDIS).incr('cluster.ids', function(err, msg) {
        cb(msg);
    });
};

Cluster.prototype.self = function() {
    var s = this.server.address();
    return [s.address, s.port].join(':');
};

Cluster.prototype.unique_id = function() {
    //TODO a job for UUID?
    var s = this.server.address();
    return [s.address, s.port, this._id++].join(':');
};

Cluster.prototype.next_id = function() {
    return this._id++;
};

Cluster.prototype.client = function(key) {//lazy clients
    if (this._clients[key] == undefined) {
        console.log('new client to', key);
        var kv = key.split(':');
        this._clients[key] = redis.createClient(kv[1], kv[0], {
            max_attempts: 4
        });
        var that = this;
        this._clients[key].on('error', function(error) {
            console.warn('Client error', error, error.stack);
            that._clients[key].end();
            delete that._clients[key];
            //[FIXME] disconnecting client is a drama.
        });
    }
    return this._clients[key];
};

Cluster.prototype.call = function(who, what, arg, callback) {
    this.client(who).send_command(what, [this.serialize(arg)], callback);
};

Cluster.prototype.answer= function(who, what, job_id, arg, callback) {
    this.client(who).send_command(what, ['' + job_id, this.serialize(arg)],
            callback);
};

Cluster.prototype.work = function(queue, action, args, respond_to, callback) {
    var job_id = this.next_id();
    this.client(REDIS).multi()
        .incr(this._server_name_id)
        .rpush(queue, this.serialize([action, args, respond_to, job_id]))
        .exec(callback);
    return job_id;
};

Cluster.prototype.asyncCall = function(who, what, arg, callback) {
    //response node is provided, simple direct response should be OK
    //or something like that.
    this.redis.send_command(what, [this.serialize([arg, this.self()])],
            function(err, resp) {
                if (err) console.warn(err);
            });
// register the callback with its id
// callback can be call more than one time
};

Cluster.prototype.work_loop = function() {
    //[TODO] Raise error if no queue.
    //[TODO] A "next" callback to finish then accept a new task?
    var w = this;
    this.client(REDIS).blpop(this.queues, 0, function(err, resp) {
        if (err) {
            console.log(err);
        }
        if (resp) {
            var args = JSON.parse(resp[1]);
            var f = args.shift();
            w.worker.emit(f, args[0], args[1], args[2]);
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

exports.createCluster = function(cb) {
    var cluster = new Cluster(cb);
    return cluster;
};
