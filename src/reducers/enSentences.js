// @flow
import type { SentenceTranslation } from '../utils/english/grammar'
import type { Action } from '../actions'

export type EnSentencesState = Array<SentenceTranslation>

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

export const getEnSentence = (state: EnSentencesState, index: number): SentenceTranslation => state[index]
