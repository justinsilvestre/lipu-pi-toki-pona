// @flow
import type { Action } from '../actions'
import type { EnWordsState } from '../selectors/enWords'

const initialState = {}

// delete words on sentence update

export default function enWords(state: EnWordsState = initialState, action: Action): EnWordsState {
  switch (action.type) {
    case 'CLEAR_EN_SENTENCES':
      return initialState
    case 'UPDATE_SENTENCE': {
      const newWords = {}
      action.words.forEach((word) => newWords[word.id] = word)
      return {
        ...state,
        ...newWords
      }
    }
    case 'TRANSLATE_SENTENCES_SUCCESS': {
      const newWords = {}
      action.enWords.forEach((words) => words.forEach(w => newWords[w.id] = w))
      return newWords
    }
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
