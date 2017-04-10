// @flow
import parseTokiPona from '../utils/parseTokiPona'
import type { WordsObject } from '../utils/parseTokiPona'
import type { Sentence } from '../utils/grammar'
import type { SentenceTranslation } from '../utils/english/grammar'

export type Action =
  { type: 'PARSE_SENTENCES', tpSentences: Array<Sentence>, tpWords: WordsObject }
  | { type: 'TRANSLATE_SENTENCES' }
  | { type: 'TRANSLATE_SENTENCES_SUCCESS', enSentences: Array<SentenceTranslation> }


export const parseSentences = (text: string) : Action => {
  const { sentences, words } = parseTokiPona(text)
  return ({
    type: 'PARSE_SENTENCES',
    tpSentences: sentences,
    tpWords: words,
  })
}

export const translateSentences = () : Action => ({
  type: 'TRANSLATE_SENTENCES',
})

export const translateSentencesSuccess = (enSentences: Array<SentenceTranslation>) : Action => ({
  type: 'TRANSLATE_SENTENCES_SUCCESS',
  enSentences,
})
