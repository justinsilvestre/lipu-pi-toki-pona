// @flow
import type { Action } from '../actions'

import type { EnSentencesState } from '../selectors/enSentences'

export default function enSentences(state: EnSentencesState = [], action: Action): EnSentencesState {
  switch (action.type) {
    case 'TRANSLATE_SENTENCES_SUCCESS':
      return action.enSentences
    case 'UPDATE_SENTENCE':
      return [
        ...state.slice(0, action.index),
        action.sentence,
        ...state.slice(action.index + 1),
      ]
    case 'CLEAR_EN_SENTENCES':
      return []
    default:
      return state
  }
}
