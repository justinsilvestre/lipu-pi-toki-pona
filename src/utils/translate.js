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

export default async function translate(sentences: Array<Sentence>, words: WordsObject) : Promise<Array<SentenceTranslation>> {
  return Promise.all(sentences.map(s => sentence(words, s)))
}
