// @flow
import type { SentenceTranslation } from '../utils/english/grammar'
import type { Action } from '../actions'

export type EnSentencesState = Array<SentenceTranslation>

export default function enSentences(state: EnSentencesState = [], action: Action): EnSentencesState {
  switch (action.type) {
    case 'TRANSLATE_SENTENCES_SUCCESS':
      return action.enSentences
    default:
      return state
  }
}

export const getEnSentence = (state: EnSentencesState, index: number): SentenceTranslation => state[index]
