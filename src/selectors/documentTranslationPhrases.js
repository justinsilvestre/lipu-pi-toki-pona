// @flow
import type { Action } from '../actions'
import type { WordId } from '../selectors/tpWords'
import type { PhraseTranslationId } from '../selectors/phraseTranslations'

export type State = {
  [wordId: WordId]: PhraseTranslationId,
}
