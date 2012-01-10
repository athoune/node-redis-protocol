var redis = require('redis');

var cpt = 0;

var Client = function(port, _address) {
    var address = _address || 'localhost';
    this.redis = redis.createClient(port, address);
    //Use JSON, tnetstrings or any serialization
    this.serialize = JSON.stringify;
    this.unserialize = JSON.parse;
};

Client.prototype.id = function() {
    //TODO host and port
    return process.pid + ':' + cpt++;
};

Client.prototype.call = function(what, arg, callback) {
    this.redis.send_command(what, this.serialize(arg), callback);
};

Client.prototype.work = function(queue, action, args, respond_to, callback) {
    this.redis.rpush(queue, this.serialize([action, args, respond_to]), callback);
};

Client.prototype.asyncCall = function(what, arg, callback) {
    //response node is provided, simple direct response should be OK or something like that.
    this.redis.send_command(what, [this.serialize([arg, this.id()])],
            function(err, resp) {
                if(err) console.warn(err);
            });
// register the callback with its id
// callback can be call more than one time
};

exports.createClient = function() {
    return new Client();
}
