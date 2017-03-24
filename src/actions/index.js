// @flow
import parseTokiPona from '../utils/parseTokiPona'
import type { WordsObject } from '../utils/parseTokiPona'
import type { Sentence, WordId } from '../utils/grammar'
import type { SentenceTranslation } from '../utils/english/grammar'
import type { Action as SentenceAction } from './sentence'
import type { Action as MouseAction } from './mouse'

export type Action =
  | SentenceAction
  | MouseAction

export * from './sentence'
export * from './mouse'
