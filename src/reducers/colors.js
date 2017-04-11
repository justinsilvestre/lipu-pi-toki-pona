import getHighlighting from '../utils/getHighlighting'

export default function tpSentences(state = {}, action) {
  switch (action.type) {
    case 'PARSE_SENTENCES':
      return action.tpSentences.map(s => getHighlighting(action.tpWords, s.words))
    default:
      return state
  }
}
