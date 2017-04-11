export default function tpSentences(state = [], action) {
  switch (action.type) {
    case 'PARSE_SENTENCES':
      return action.tpSentences
    default:
      return state
  }
}
