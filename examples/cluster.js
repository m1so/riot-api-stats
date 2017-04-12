import cluster from 'cluster'
import os from 'os'
import Worker from '../dist/worker'

// Load the environment variables
require('dotenv').config()

if (cluster.isMaster) {
  const numWorkers = os.cpus().length

  console.log(`Master cluster setting up ${numWorkers} workers...`)

  for (var i = 0; i < numWorkers; i++) {
    cluster.fork()
  }

  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} is online`)
  })

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`)
    console.log('Starting a new worker')
    cluster.fork()
  })
} else {
  const worker = new Worker({
    ports: {
      // Push messages to this port (for example from a route)
      incoming: process.env.ZEROMQ_SENDER_PORT,
      // Pull messages from this port (for example using a socket server)
      outgoing: process.env.ZEROMQ_RECEIVER_PORT
    },
    processing: {
      matchlist: function myMatchlistProcessing(summonerId, region, matchlist, metadata) {},
      matches: function myMatchesProcessing(region, matches) {},
      // stats: function myStatsProcessing(summonerId, region, matches) {},
    },
    onError: function myErrorHandler() {},
    onSuccess: function mySuccessHandler() {},
  })

  worker.start()
}
