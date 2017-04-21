// @flow
import type { Sentence } from './grammar'
import type { SentenceTranslation } from './english/grammar'
import type { EnglishPartOfSpeech } from './english/partsOfSpeech'
import type { WordsObject } from './parseTokiPona'
// import { map, flatten, intersperse, last } from 'ramda'
// import RiTa, { SINGULAR, PLURAL, FIRST_PERSON, THIRD_PERSON } from './rita'
import sentence, { realizeSentence } from './english/sentence'
import type { Lookup } from '../actions/lookup'

export type WordTranslation = {
  text: string,
  pos: EnglishPartOfSpeech,
}

export default async function translate(sentences: Array<Sentence>, words: WordsObject, lookup: Lookup) : Promise<Array<SentenceTranslation>> {
  return Promise.all(sentences.map(s => sentence(lookup, s)))
}
