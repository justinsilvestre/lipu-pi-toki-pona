// @flow
export type WordId = string

export type RawParticleRole =
  | 'compound_complement_particle'
  | 'indicative_particle'
  | 'optative_particle'
  | 'context_particle'
  | 'direct_object_particle'
  | 'and_particle'
  | 'or_particle'
export type ParticleRole = RawParticleRole | 'vocative_particle'
export type SubstantiveRole =
  | 'subject'
  | 'context_subject'
  | 'context_predicate'
  | 'complement'
  | 'direct_object'
  | 'vocative'
  | 'infinitive'
  | 'prepositional_object'
export type Role = ParticleRole | SubstantiveRole

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

// roles with variant part of speech:
// predicate: any substantive
// complement: i or prep

export const ROLES_WITH_INVARIANT_POS = {
  subject: 'i',
  context_subject: 'i',
  direct_object: 'i',
  vocative: 'i',
  particle: 'p',
  vocative_particle: 'p',
  prepositional_object: 'i',
}

// const getPartOfSpeech = (sentence: Sentence, word: Word) : TokiPonaPartOfSpeech =>
//   ROLES_WITH_INVARIANT_POS[word.role]
//   || ()
//   predicate: '',          // i t prev prep
//   context_predicate: '',  // i t prev prep
//   complement: '',         // i prep         -- prev?
//   infinitive: '',         // i t prev prep
// }


export type Sentence = {
  words: Array<WordId>,
  // words: Array<string>,
  vocative?: string,
  contexts?: Array<string>,
  subjects?: Array<string>,
  predicates: Array<string>,
  mood: 'indicative' | 'optative' | 'interrogative',
  index: number,
}
