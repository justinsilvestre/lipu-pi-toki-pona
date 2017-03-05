// @flow

import type { WordTranslation } from '../dictionary'

export type GrammaticalNumber = 'SINGULAR' | 'PLURAL'
export type Case = 'NOMINATIVE' | 'OBLIQUE'

export type NounPhrase = {
  head: WordTranslation,
  determiner?: WordTranslation,
  adjectivePhrases?: Array<AdjectivePhrase>, // eslint-disable-line no-use-before-define
  prepositionalPhrases?: Array<PrepositionalPhrase>, // eslint-disable-line no-use-before-define
  appositives?: any,
  number: 'SINGULAR' | 'PLURAL',
  isPronoun: boolean,
}

export type PrepositionalPhrase = {
  head: WordTranslation,
  objects: Array<NounPhrase>,
}

export type VocativePhrase = { head: NounPhrase }

export type AdverbPhrase = {
  head: WordTranslation,
  adverbPhrases?: Array<AdverbPhrase>,
  prepositionalPhrases: Array<PrepositionalPhrase>,
  isNegative: boolean,
}

export type AdjectivePhrase = {
  head: WordTranslation,
  adverbPhrases?: Array<AdverbPhrase>,
  prepositionalPhrases?: Array<PrepositionalPhrase>,
  isNegative: boolean,
}

export type SubjectComplementPhrase = NounPhrase | AdjectivePhrase | PrepositionalPhrase

export type VerbPhrase = {
  head: WordTranslation,
  adverbPhrases?: Array<AdverbPhrase>,
  prepositionalPhrases?: Array<PrepositionalPhrase>,
  subjectComplements?: Array<NounPhrase | AdjectivePhrase>,
  directObjects?: Array<NounPhrase>,
  isNegative?: boolean,
  isInfinitive?: boolean,
  isBareInfinitive?: boolean,
}

export type PredicatePhrase = {
  phrases: Array<VerbPhrase>,
}
export type SubjectPhrase = {
  nounPhrases: Array<NounPhrase>,
  isPlural: boolean,
  isFirstPerson: boolean,
  animacy?: 'ANIMATE' | 'INANIMATE',
}

export type SubordinateClause = {
  conjunction: WordTranslation,
  subjectPhrase: SubjectPhrase,
  predicatePhrase: PredicatePhrase,
  endPunctuation?: string,
}

export type SentenceTranslation = {
  vocative?: VocativePhrase,
  subordinateClauses?: Array<SubordinateClause>,
  subjectPhrase: SubjectPhrase,
  predicatePhrase: PredicatePhrase,
  adverbPhrases?: Array<AdverbPhrase>,
  prepositionalPhrases?: Array<PrepositionalPhrase>,
  endPunctuation?: string,
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
  | 'vp' // prepositional verb (not phrasal)
  | 'vc' // copula
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
