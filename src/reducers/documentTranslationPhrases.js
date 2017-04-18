// @flow
import type { Action } from '../actions'
import type { WordId } from '../utils/grammar'

export type State = {
  [wordId: WordId]: number, // phraseTranslation ID
}

export default function documentTranslationPhrases(state: State = {}, action: Action): State {
  switch (action.type) {
    case 'SET_WORD_TRANSLATION':
    case 'CHANGE_WORD_TRANSLATION':
      return {
        ...state,
        [action.wordId]: action.phraseTranslationId,
      }
    default:
      return state
  }
}
