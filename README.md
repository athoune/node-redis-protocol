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

Use
---

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

Licence
-------

MIT
