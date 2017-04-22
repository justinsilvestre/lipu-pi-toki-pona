// @flow
import type { WordId } from '../selectors/tpWords'

export type Mood =
  'indicative'
  | 'optative'
  | 'interrogative'

export type SentenceContext = {
  subjects?: Array<WordId>,
  predicates: Array<WordId>,
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


export type TpSentencesState = Array<Sentence>
