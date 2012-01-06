var redisd = require('../lib/redisd'),
    redis = require('redis');

var PORT = 4242;

module.exports = {
    setUp: function(next) {
        var that = this;
        this.server = redisd.createServer(function(command) {
            if(command[0] === 'info') {
                this.encode('redis_version:2.4.5');
            } else {
                this.singleline('OK');
            }
            that.command = command;
        });
        this.client = redis.createClient(PORT);
        this.server.listen(PORT, function() {
            next();
        });
    },
    tearDown: function(next) {
        this.client.end();
        this.server.close();
        next();
    },
    'test simple': function(test) {
        var that = this;
        this.client.send_command("PLOP", [42], function (err, replies) {
            test.deepEqual([ 'PLOP', '42' ], that.command);
            test.done();
        });
    }
};
