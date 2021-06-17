// @flow
import type { Action } from '../actions'
import type { WordId } from './tpWords'
import type { PhraseTranslationId } from './phraseTranslations'

export type State = {
  [wordId: WordId]: PhraseTranslationId,
}
