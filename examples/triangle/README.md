Triangle example
================

The front is a http server. Each web request is sent to a queue.
workers pick tasks from the queue and answer to the right http connection.

Everybody speak the same language : redis protocol + json serialization.
You can see that as a _resqueue_ with answers,
or a _mongrel2_ with zeromq replaced by redis protocol.

The worker can be implemented with what you wont, even sequential technology,
node will wait for you and keep http connection opened.

The worker can answer more than one time, for a streamed answer or
a long connection, like _server side event_ or _websocket_.

Big picture
-----------

```

                           redis
  http  +-------+        +-------+  lpoll +---------+
<------>|       |------->| Queue |<-------|         |
        | Front |        +-------+        | Workers |
        |       |<------------------------|         |
        +-------+                         +---------+

```

Peoples loves diagram too.

```
            Web Server         Redis         Worker
 http request   |                |             |
 -------------->|                |             |
                |  push task     |             |
                +--------------->|             |
                |                | poll task   |
                |                +------------>|
                |             answer           |
                |<-----------------------------+
  http response |
 <--------------+

```

Try it
------

Dependency

    npm install connect

In a first terminal:

    node front.js

In a second terminal:

    node worker.js & node worker.js & node worker.js & node worker.js

In a third terminal:

    siege -c 100 -t 30s http://localhost:1337
