// @flow
import parseTokiPona from '../utils/parseTokiPona'
import type { WordsObject } from '../utils/parseTokiPona'
import type { Sentence } from '../utils/grammar'
import type { SentenceTranslation } from '../utils/english/grammar'
import type { TpLemmasState, TpLemma } from '../reducers/tpLemmas'

export type Action =
  { type: 'PARSE_SENTENCES', tpSentences: Array<Sentence>, tpWords: WordsObject, properNouns: Array<TpLemma> }
  | { type: 'TRANSLATE_SENTENCES' }
  | { type: 'TRANSLATE_SENTENCES_SUCCESS', enSentences: Array<SentenceTranslation> }


export const parseSentences = (text: string, tpLemmas: TpLemmasState) : Action => {
  const { sentences, words, properNouns } = parseTokiPona(text, tpLemmas)
  return ({
    type: 'PARSE_SENTENCES',
    tpSentences: sentences,
    tpWords: words,
    properNouns: properNouns,
  })
}

export const translateSentences = () : Action => ({
  type: 'TRANSLATE_SENTENCES',
})

export const translateSentencesSuccess = (enSentences: Array<SentenceTranslation>) : Action => ({
  type: 'TRANSLATE_SENTENCES_SUCCESS',
  enSentences,
})
