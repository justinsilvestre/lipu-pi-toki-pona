// @flow
import type { Action } from '../actions'
import type { EnWordsState } from '../selectors/enWords'

export default function enLemmas(state: EnWordsState = {}, action: Action): EnWordsState {
  switch (action.type) {
    case 'ADD_PHRASE_TRANSLATION':
    if (!action.enWord) return state
    return {
      ...state,
      [action.enWord.id]: action.enWord,
    }
    default:
      return state
  }
}
