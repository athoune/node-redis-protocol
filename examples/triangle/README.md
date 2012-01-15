Triangle example
================

The front is a http server. Each web request is sent to a queue.
workers pick tasks from the queue and answer to the right http connection.

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

Try it
------

In a first terminal:

    node front.js

In a second terminal:

    node worker.js & node worker.js & node worker.js & node worker.js

In a third terminal:

    siege -c 100 -t 30s http://localhost:1337
