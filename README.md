Node Redis protocol
===================

Implement your own server using the redis protocol.

Build a fake redis or a redis slave.

Install
-------

  npm install

Test
----

  npm test

## Use cases ##

### Fake redis server ###

```javascript
var redisd = require('redisd');
var server = redisd.createServer(function(command) {
      console.log('query', command);
      this.encode(['pim', 'pam']);// the answer
});
server.listen(6379, function() {
    console.log('fake redis started');
});
```
This code is available at project root level.

You can talk to it with any redis tools. Try *redis-cli*.

### Mix real and fake redis ###

_examples/triangle_ contains an example of a web server with a queue.
One front pushing tasks to a queue.
Workers long polling (with BLPOP) this queue and directly answering to the right web connection.

Licence
-------

MIT
