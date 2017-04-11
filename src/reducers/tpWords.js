export default function tpWords(state = {}, action) {
  switch (action.type) {
    case 'PARSE_SENTENCES':
      return action.tpWords
    default:
      return state
  }
}
