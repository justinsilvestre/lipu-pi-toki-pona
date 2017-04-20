// @flow
import type { WordsObject } from '../utils/parseTokiPona'
import type { Sentence } from '../utils/grammar'
import type { SentenceTranslation } from '../utils/english/grammar'
import type { TpLemmasState, TpLemma } from '../reducers/tpLemmas'

export type Action =
  { type: 'PARSE_SENTENCES_SUCCESS', tpSentences: Array<Sentence>, tpWords: WordsObject, properNouns: Array<TpLemma> }
  | { type: 'PARSE_SENTENCES', text: string, tpLemmas: TpLemmasState }
  | { type: 'PARSE_SENTENCES_FAILURE' }
  | { type: 'TRANSLATE_SENTENCES_SUCCESS', enSentences: Array<SentenceTranslation> }
  | { type: 'UPDATE_SENTENCE', index: number, sentence: Sentence }


export const parseSentencesSuccess = (tpSentences, tpWords, properNouns): Action => ({
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

export const translateSentencesSuccess = (enSentences: Array<SentenceTranslation>) : Action => ({
  type: 'TRANSLATE_SENTENCES_SUCCESS',
  enSentences,
})
