// @flow
import type { SentenceTranslation } from '../utils/english/grammar'
import type { Action } from '../actions'
import type { Sentence } from '../utils/grammar'

export type TpSentencesState = Array<Sentence>

export default function tpSentences(state: TpSentencesState = [], action: Action): TpSentencesState {
  switch (action.type) {
    case 'PARSE_SENTENCES':
      return action.tpSentences
    default:
      return state
  }
}
