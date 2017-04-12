// @flow
import type { SentenceTranslation } from '../utils/english/grammar'
import type { Action } from '../actions'
import type { WordsObject } from '../utils/parseTokiPona'

export type TpWordsState = WordsObject

export default function tpWords(state: TpWordsState = {}, action: Action): TpWordsState {
  switch (action.type) {
    case 'PARSE_SENTENCES':
      return action.tpWords
    default:
      return state
  }
}
