// @flow
import type { Role } from './tokiPonaRoles'

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

export type Mood =
  'indicative'
  | 'optative'
  | 'interrogative'

export type SentenceContext = {
  subjects?: Array<WordId>,
  predicates?: Array<WordId>,
}


export type Sentence = {
  words: Array<WordId>,
  vocative?: string,
  contexts?: Array<SentenceContext>,
  subjects?: Array<WordId>,
  predicates: Array<WordId>,
  mood: 'indicative' | 'optative' | 'interrogative',
  index: number,
  seme?: Array<WordId>,
}
