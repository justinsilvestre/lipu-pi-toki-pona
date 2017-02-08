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

  anu?: boolean,
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
  contexts?: Array<{ subjects?: Array<WordId>, predicates?: Array<WordId> }>,
  subjects?: Array<WordId>,
  predicates: Array<WordId>,
  mood: 'indicative' | 'optative' | 'interrogative',
  index: number,
  seme?: Array<WordId>,
}

export type EnglishPartOfSpeech =
  'x' // no lexical equivalent
  | 'adv'
  | 'n'
  | 'adj'
  | 'int'
  | 'num'
  | 'prep'
  | 'conj'
  | 'vt' // transitive verb
  | 'vi' // intransitive verb
  | 'vm' // modal verb
  | 'onom'
  | 'd' // determiner
  | 'dp' // plural determiner
  | 'ds' // singular determiner
  | 'pn' // 3rd-person caseless singular pronoun, or pu?/proper noun
  | 'pnp' // caseless plural pronoun
  | 'pnin' // 1st-person nominative singular pronoun
  | 'pnio' // 1st-person oblique singular pronoun
  | 'pnpn' // nominative plural pronoun
  | 'pnpo' // oblique plural pronoun
  | 'pns' // caseless singular pronoun
  | 'pnsn' // 3rd-person nominative singular pronoun
  | 'pnso' // 3rd-person oblique singular pronoun
  | 'pno' // oblique pronoun (cannot be subject, number maybe irrelevant)
  | 'prop'
