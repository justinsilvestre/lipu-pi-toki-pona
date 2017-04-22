// @flow
import type { Action } from '../actions'
import type { EnWordsState } from '../selectors/enWords'

const initialState = {}

export default function enLemmas(state: EnWordsState = initialState, action: Action): EnWordsState {
  switch (action.type) {
    case 'TRANSLATE_SENTENCES_SUCCESS':
      return action.enWords
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
