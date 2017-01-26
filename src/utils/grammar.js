// @flow
import type { Role } from './tokiPonaRoles'
import * as roles from './tokiPonaRoles'

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

  head?: WordId,
  complements?: Array<WordId>,
  directObjects?: Array<WordId>,
  infinitive?: WordId,
  prepositionalObject?: WordId,
  context?: number,
}

export type Mood =
  'indicative'
  | 'optative'
  | 'interrogative'

export type Sentence = {
  words: Array<WordId>,
  vocative?: string,
  contexts?: Array<string>,
  subjects?: Array<string>,
  predicates: Array<string>,
  mood: 'indicative' | 'optative' | 'interrogative',
  index: number,
}
