// @flow
import type { Sentence, Word, WordId } from './grammar'
import { isComplementOf } from './words'
import type { WordsObject } from './parseTokiPona'

export type Color = [number, number, number]

const baseColor = (h) => [h, 35, 55]

const BASE_COLORS : Object = {
  subject: baseColor(50),
  predicate: baseColor(207),
  direct_object: baseColor(90),
  direct_object_particle: baseColor(90),
  prepositional_object: baseColor(90),
  infinitive: baseColor(90),

  context_subject: baseColor(275),
  context_predicate: baseColor(335),
  context_particle: baseColor(335),
  vocative: baseColor(36),
  vocative_particle: baseColor(36),
  particle: baseColor(90),
}

const darken = ([h, s, l]: Color, level: number) => [h + level * 4, s - level * 15, l - level * 10]

// const PREPOSED_PARTICLE_ROLES = ['compound_complement_particle', 'indicative_particle', 'optative_particle', 'or_particle', 'and_particle']
const nextWord = (sentenceWords: Array<WordId>, word: WordId) : WordId => sentenceWords[sentenceWords.indexOf(word) + 1]
const getPhraseHead = (words: WordsObject, sentenceWords: Array<WordId>, word: WordId) : WordId => {
  const { head } = words[word]
  return typeof head  === 'string' ? head : nextWord(sentenceWords, word)
}

type GetBaseColor = (words: WordsObject, sentenceWords: Array<WordId>, word: WordId, level?: number) => Color
const getBaseColor : GetBaseColor = (words, sentenceWords, word, level = 0) => {
  const { role } = words[word]
  return BASE_COLORS[role]
    ? darken(BASE_COLORS[role], level)
    : getBaseColor(words, sentenceWords, getPhraseHead(words, sentenceWords, word), level + 1)
}


const getHighlighting = (words: WordsObject, sentenceWords: Array<WordId>) : Array<Color> =>
  sentenceWords.map(word => getBaseColor(words, sentenceWords, word))


export default getHighlighting
