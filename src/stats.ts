const skipStatKeys = [
  'largest', 'Score', 'item',
]
const statKeyMap = {
  'winner': 'wins',
}
const initialStats = {
  'sessionsPlayed': 0,
}
const mapStatKey = (statKey) => statKeyMap[statKey] || statKey
const int = (numLike) => (numLike | 0)
const add = (a, b) => int(a) + int(b)

export default {
  fromMatches(summonerId, region, matches) {
    return matches.reduce((aggregate, match) => {
      let { participantId } = match.participantIdentities.find(id => id.player.summonerId === summonerId)
      let participant = match.participants[participantId - 1]
      let championId = participant.championId
      let champStats = participant.stats
      // Initialize the champion stats
      let stats = Object.assign({}, initialStats, aggregate[championId])
      // Add statistics
      for (let origStatKey in champStats) {
        // Skip unwanted stats
        if (skipStatKeys.some(skipKey => origStatKey.includes(skipKey))) {
          continue
        }
        let statKey = mapStatKey(origStatKey)
        // Force transform into ints, the api doesn't provide any floats in stats.
        stats[statKey] = add(stats[statKey], champStats[statKey])
      }
      // Add total games played
      stats['sessionsPlayed']++

      // Merge the overriden stats with the aggregate
      return Object.assign({}, aggregate, { [championId]: stats })
    }, {})
  }
}
