// @flow
import type { Action } from '../actions'

export type PhraseTranslation = {
  id: string,
  enLemmaId: string,
  tpLemmaId: string,
}

export type State = {
  [id: string]: PhraseTranslation,
}
