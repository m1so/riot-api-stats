import Matchlist from './matchlist'
import Matches from './matches'
import stats from './stats'
import zmq from 'zmq'

const receiver = zmq.socket('pull')
const sender = zmq.socket('push')

export default class Worker {
  constructor({ ports = {}, processing = {}, onSuccess = null, onError = null } = {}) {
    this.incomingPort = ports.incoming || 12345
    this.outgoingPort = ports.outgoing || 12346

    this.onMatchlist = processing.matchlist || (() => {})
    this.onMatches = processing.matches || (() => {})
    this.onStats = processing.stats || stats.fromMatches
    this.onSuccess = onSuccess || (() => {})
    this.onError = onError || (() => {})
  }

  start() {
    receiver.connect(`tcp://127.0.0.1:${this.incomingPort}`)
    sender.connect(`tcp://127.0.0.1:${this.outgoingPort}`)

    receiver.on('message', async (data) => {
      const startTime = process.hrtime()
      data = JSON.parse(data)
      const summonerId = parseInt(data.summonerId)
      const region = data.region

      try {
        const matchlist = new Matchlist(summonerId, region) // , { beginTime: '1491053887327' }
        const { matchlist: matchlistData, metadata } = await matchlist.load()
        this.onMatchlist(summonerId, region, matchlistData, metadata)
        const matchesData = await Matches.getFromMatchlist(matchlistData)
        this.onMatches(region, matchesData)
        const statsData = this.onStats(summonerId, region, matchesData)

        sender.send(JSON.stringify({
          stats: statsData,
          metadata: Object.assign({}, metadata, { summonerId, region }),
          status: { success: true },
        }))
      } catch (err) {
        console.log(err)
        sender.send(JSON.stringify({
          status: { success: false },
        }))
      }

      const processingTime = process.hrtime(startTime)
      console.log(`Done in ${(processingTime[0] + processingTime[1] * 1e-9).toFixed(3)}s`)
    })
  }
}
