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
var redisd = require('redis-protocol');
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

Continous integration
---------------------

[![Build Status](https://secure.travis-ci.org/athoune/node-redis-protocol.png)](http://travis-ci.org/athoune/node-redis-protocol)

Licence
-------

MIT
