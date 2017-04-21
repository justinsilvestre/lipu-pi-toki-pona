// @flow
export type GrammaticalNumber = 'SINGULAR' | 'PLURAL'
export type Case = 'NOMINATIVE' | 'OBLIQUE'

export type EnLemmaId = number | string
export type EnLemma = {
  id: EnLemmaId,
  text: string,
  pos: EnglishPartOfSpeech,
}

export type EnWord = {
  before?: string,
  after?: string,
  lemmaId: EnLemmaId,
  pos: string,
  text: string,
  phraseTranslationId?: number,
}

const lemma = (text, pos): EnWord => ({ text, lemmaId: text, pos })
export const NOT = lemma('not', 'adv')
export const OF = lemma('of', 'prep')
export const OR = lemma('or', 'conj')
export const AND = lemma('and', 'conj')
export const BY = lemma('by', 'conj')
export const BE = lemma('be', 'vc')

export type NounPhrase = {
  head: EnLemma,
  determiner?: EnLemma,
  adjectivePhrases?: Array<AdjectivePhrase>, // eslint-disable-line no-use-before-define
  prepositionalPhrases?: Array<PrepositionalPhrase>, // eslint-disable-line no-use-before-define
  appositives?: any,
  number: 'SINGULAR' | 'PLURAL',
  isPronoun: boolean,
}

export type PrepositionalPhrase = {
  head: EnLemma,
  objects: Array<NounPhrase>,
}

export type VocativePhrase = { head: NounPhrase }

export type AdverbPhrase = {
  head: EnLemma,
  adverbPhrases?: Array<AdverbPhrase>,
  prepositionalPhrases: Array<PrepositionalPhrase>,
  isNegative: boolean,
}

export type AdjectivePhrase = {
  head: EnLemma,
  adverbPhrases?: Array<AdverbPhrase>,
  prepositionalPhrases?: Array<PrepositionalPhrase>,
  isNegative: boolean,
}

export type SubjectComplementPhrase = NounPhrase | AdjectivePhrase | PrepositionalPhrase

export type VerbPhrase = {
  head: EnLemma,
  adverbPhrases?: Array<AdverbPhrase>,
  prepositionalPhrases?: Array<PrepositionalPhrase>,
  subjectComplements?: Array<SubjectComplementPhrase>,
  directObjects?: Array<NounPhrase>,
  infinitive?: VerbPhrase,
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
  conjunction: EnLemma,
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
