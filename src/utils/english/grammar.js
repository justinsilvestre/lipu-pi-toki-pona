import type { WordTranslation } from '../dictionary'

export type GrammaticalNumber = 'SINGULAR' | 'PLURAL'
export type Case = 'NOMINATIVE' | 'OBLIQUE'

export type NounPhrase = {
  head: WordTranslation,
  determiner?: WordTranslation,
  adjectivePhrases?: any,
  prepositionalPhrases?: any,
  appositives?: any,
}

export type AdjectivePhrase = {
  head: WordTranslation,
  // adverbs?: Array<AdverbPhrase>,
  prepositionalPhrases: Array<PrepositionalPhrase>,
}

export type VerbPhrase = {
  head: WordTranslation,
  adverbPhrases: any,
  prepositionalPhrases: any,
}

export type PrepositionalPhrase = {
  preposition: WordTranslation,
  object: NounPhrase,
}

export type PredicatePhrase = {
  phrases: Array<VerbPhrase>,
}
export type SubjectPhrase = {
  nounPhrases: Array<NounPhrase>,
  isPlural: boolean,
  isFirstPerson: boolean,
}
