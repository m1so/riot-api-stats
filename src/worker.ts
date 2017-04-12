import Matchlist from './matchlist'
import Matches from './matches'
import stats from './stats'
import * as zmq from 'zmq'

const receiver = zmq.socket('pull')
const sender = zmq.socket('push')

export interface WorkerConfig {
  ports?: {
    incoming?: number,
    outgoing?: number,
  },
  processing?: {
    matchlist?: (summonerId: number, region: string, matchlist: object, metadata: object) => any,
    matches?: (region: string, matches: object) => any,
    stats?: (summonerId: number, region: string, matches: object) => any,
  },
  onError?: (error: Error) => void,
  onSuccess?: () => void,
}

export default class Worker {
  private incomingPort: number
  private outgoingPort: number
  private onMatchlist: (summonerId: number, region: string, matchlist: object, metadata: object) => any
  private onMatches: (region: string, matches: object) => any
  private onStats: (summonerId: number, region: string, matches: object) => any
  private onSuccess: () => void
  private onError: (error: Error) => void

  constructor({ ports = {}, processing = {}, onSuccess = null, onError = null }: WorkerConfig = {}) {
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

    receiver.on('message', async (data: any) => {
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
