var redisd = require('./lib/redisd');

var server = redisd.createServer(function(command) {
     this.encode(['pim', 'pam']);
     console.log('query', command);
});

server.listen(6379, function() {
    console.log('fake redis started');
});
