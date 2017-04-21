// @flow
import type { Action } from '../actions'
import type { WordId } from '../utils/grammar'

export type State = {
  [wordId: WordId]: number, // phraseTranslation ID
}
