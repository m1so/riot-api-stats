# Examples

Don't forget to `npm install` the dependencies.

* __[Worker](worker.js)__ - Handles fetching the matchlist and matches for a given summoner (and a region) and does processing.
* __[Cluster](cluster.js)__ - Multiple workers running in a cluster. Note that multiple workers can also be instantiated as separate processes.
* __[Server](server.js)__ - Express server sends messages to workers after a request using ZeroMQ. Once the data is processed, client receives the results via Socket.io connection.
