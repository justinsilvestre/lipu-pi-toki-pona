// @flow
import getEnglishPhrase from './getEnglishPhrase'
import type { WordTranslation } from './getEnglishPhrase'
import type { Sentence } from './grammar'
import type { WordsObject } from './parseTokiPona'

export type SentenceTranslation = Array<WordTranslation>

export default function translate(sentences: Array<Sentence>, words: WordsObject) : Array<SentenceTranslation> {
  return sentences.map((s) => s.words.map(w => getEnglishPhrase(words[w], words)))
}
