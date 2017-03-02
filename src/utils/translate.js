// @flow
import type { Sentence } from './grammar'
import type { SentenceTranslation, EnglishPartOfSpeech } from './english/grammar'
import type { WordsObject } from './parseTokiPona'
// import { map, flatten, intersperse, last } from 'ramda'
// import RiTa, { SINGULAR, PLURAL, FIRST_PERSON, THIRD_PERSON } from './rita'
import sentence, { realizeSentence } from './english/sentence'

export type WordTranslation = {
  text: string,
  pos: EnglishPartOfSpeech,
}

export type EnglishDictionaryEntry = { [englishPartOfSpeech: EnglishPartOfSpeech]: Array<WordTranslation> }

export default function translate(sentences: Array<Sentence>, words: WordsObject) : Array<SentenceTranslation> {
  return sentences.map(s => sentence(words, s))
}
