import axios from 'axios'
import Promise from './promise'

const http = require('http')
const https = require('https')

const agentOptions = {
  keepAlive: true,
  keepAliveMsecs: 5000,
  maxFreeSockets: 10,
  maxSockets: 10000,
  maxCachedSessions: 10000,
}

const instance = axios.create({
  httpAgent: new http.Agent(agentOptions),
  httpsAgent: new https.Agent(agentOptions),
})

export default {
  getFromMatchlist: async (matchlist, region = 'euw') => {
    const matchRequests = matchlist.map(({ matchId }) => Promise.resolve(instance.get(
        `https://${region}.api.riotgames.com/api/lol/${region.toUpperCase()}/v2.2/match/${matchId}?api_key=${process.env.RIOT_API_KEY}`
      )
      // .then((data) => { console.log(`[${process.pid}] Match ${data.data.matchId}`); return data; })
    ))

    // Take only those matches that returned 200 http status code
    const matches = await Promise
      .all(matchRequests.map(p => p.reflect()))
      .then(inspections => {
        return inspections.filter(p => p.isFulfilled()).map(p => p.value())
      })
      .then(matchResponses => matchResponses.map(({ data }) => data))

    return matches
  }
}
