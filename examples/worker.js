import Worker from '../src/worker'

// Load the environment variables
require('dotenv').config()

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
