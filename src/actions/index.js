// @flow
import parseTokiPona from '../utils/parseTokiPona'
import type { TpWordsState, WordId } from '../selectors/tpWords'
import type { Sentence } from '../selectors/tpSentences'
import type { SentenceTranslation } from '../utils/english/grammar'
import type { Action as SentenceAction } from './sentence'
import type { Action as MouseAction } from './mouse'
import type { Action as LookupAction } from './lookup'

export type Action =
  | SentenceAction
  | MouseAction
  | LookupAction

export * from './sentence'
export * from './mouse'
export * from './lookup'
