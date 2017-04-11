export default function enSentences(state = [], action) {
  switch (action.type) {
    case 'TRANSLATE_SENTENCES_SUCCESS':
      return action.enSentences
    default:
      return state
  }
}
