// @flow
import type { TpWordsState } from '../selectors/tpWords'
import type { Sentence } from '../selectors/tpSentences'
import type { SentenceTranslation } from '../utils/english/grammar'
import type { TpLemmasState, TpLemma } from '../selectors/tpLemmas'
import type { EnWord, EnWordId, EnWordsState } from '../selectors/enWords'

export type Action =
  { type: 'PARSE_SENTENCES_SUCCESS', tpSentences: Array<Sentence>, tpWords: TpWordsState, properNouns: Array<TpLemma> }
  | { type: 'PARSE_SENTENCES', text: string, tpLemmas: TpLemmasState }
  | { type: 'PARSE_SENTENCES_FAILURE' }
  | { type: 'TRANSLATE_SENTENCES_SUCCESS', enSentences: Array<SentenceTranslation>, enWords: { [id: EnWordId]: EnWord} }
  | { type: 'UPDATE_SENTENCE', index: number, sentence: Sentence }


export const parseSentencesSuccess = (tpSentences: Array<Sentence>, tpWords: TpWordsState, properNouns: Array<TpLemma>): Action => ({
  type: 'PARSE_SENTENCES_SUCCESS',
  tpSentences,
  tpWords,
  properNouns,
})

export const parseSentencesFailure = () => ({
  type: 'PARSE_SENTENCES_FAILURE',
})

export const parseSentences = (text: string) => ({
  type: 'PARSE_SENTENCES',
  text,
})

export const translateSentences = () : Action => ({
  type: 'TRANSLATE_SENTENCES',
})

export const translateSentencesSuccess = (enSentences: Array<SentenceTranslation>, enWords: EnWordsState) : Action => ({
  type: 'TRANSLATE_SENTENCES_SUCCESS',
  enSentences,
  enWords,
})
