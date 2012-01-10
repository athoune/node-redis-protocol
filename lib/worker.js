var events = require('events'),
    util = require('util'),
    redis = require('redis');

var Worker = function(queue) {
    this.client = redis.createClient();
    this.queue = queue;
};

util.inherits(Worker, events.EventEmitter);

Worker.prototype.loop = function() {
    var w = this;
    this.client.lpop(this.queue, function(err, resp) {
        if (resp) {
            var args = JSON.parse(resp);
            var f = args.shift();
            w.emit(f, args[0], args[1]);
        }
        if (resp) {
            process.nextTick(function() {
                w.loop();
            });
        } else {
            //the queue is empty, don't flood redis
            setTimeout(function() {
                w.loop();
            }, 1000);
        }
    });
};

exports.Worker = Worker;
