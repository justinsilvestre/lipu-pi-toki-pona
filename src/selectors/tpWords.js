// @flow
import type { Action } from '../actions'
import type { Role } from '../utils/tokiPonaRoles'
import type { TpLemmaId } from '../selectors/tpLemmas'

export type WordId = string

export type TokiPonaPartOfSpeech =
    'i'
    | 't'
    | 'prev'
    | 'prep'
    | 'p'

export type Word = {
  id: WordId,
  text: string,
  index: number,
  sentence: number,
  before: string,
  after: string,
  role: Role,
  pos: TokiPonaPartOfSpeech,

  lemmaId: TpLemmaId,

  anu?: boolean,
  negative?: boolean,
  interrogative?: boolean,
  head?: WordId,
  complements?: Array<WordId>,
  directObjects?: Array<WordId>,
  infinitive?: WordId,
  prepositionalObject?: WordId,
  context?: number,
}

export type TpWordsState = { [wordId: WordId]: Word }
