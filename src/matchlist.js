import axios from 'axios'
import querystring from 'querystring'

export default class Matchlist {
  constructor(summonerId, region = 'euw', options = {}) {
    this.summonerId = summonerId
    this.region = region
    this.options = Object.assign(options.beginTime || options.beginIndex || options.endTime || options.endIndex || options.seasons ? {} : {
      beginTime: '1481108400000', // (pre)season2017 timestamp since the 'seasons' option doesn't work currently
    }, options)

    this.metadata = {}
    this.matchlist = []
  }

  async load() {
    const url = `https://${this.region}.api.riotgames.com/api/lol/${this.region.toUpperCase()}/v2.2/matchlist/by-summoner/${this.summonerId}`
    const query = querystring.stringify({
      seasons: this._toStringifyOption('seasons'),
      rankedQueues: this._toStringifyOption('rankedQueues'),
      championIds: this._toStringifyOption('championIds'),
      beginTime: this.options.beginTime,
      endTime: this.options.endTime,
      beginIndex: this.options.beginIndex,
      endIndex: this.options.endIndex,
      api_key: process.env.RIOT_API_KEY,
    })

    let { data: { matches = [], startIndex, endIndex, totalGames } } = await axios.get(`${url}?${query}`)

    this.metadata = { startIndex, endIndex, totalGames }
    this.matchlist = matches

    return { matchlist: matches, metadata: this.metadata }
  }

  _toStringifyOption(key) {
    if (!this.options[key]) {
      return null
    }

    return typeof this.options[key] === 'string' ? this.options[key] : this.options[key].join(',')
  }
}
