// @flow
import * as roles from './tokiPonaRoles'
import { isComplementOf } from './words'
import type { TpWordsState, Word, WordId } from '../selectors/tpWords'
import type { Sentence } from '../selectors/tpSentences'

export type Color = [number, number, number]

const baseColor = (h) => [h, 35, 55]

const BASE_COLORS : Object = {
  [roles.SUBJECT]: baseColor(50),
  [roles.PREDICATE]: baseColor(207),
  [roles.DIRECT_OBJECT]: baseColor(90),
  [roles.DIRECT_OBJECT_PARTICLE]: baseColor(90),
  [roles.PREPOSITIONAL_OBJECT]: baseColor(90),
  [roles.INFINITIVE]: baseColor(90),

  [roles.CONTEXT_SUBJECT]: baseColor(275),
  [roles.CONTEXT_PREDICATE]: baseColor(335),
  [roles.CONTEXT_PARTICLE]: baseColor(335),
  [roles.VOCATIVE]: baseColor(36),
  [roles.VOCATIVE_PARTICLE]: baseColor(36),
  // [PARTICLE]: baseColor(90),
}

const darken = ([h, s, l]: Color, level: number) => [h + level * 4, s - level * 15, l - level * 10]

// const PREPOSED_PARTICLE_ROLES = ['compound_complement_particle', 'indicative_particle', 'optative_particle', 'or_particle', 'and_particle']
const nextWord = (sentenceWords: Array<WordId>, word: WordId) : WordId => sentenceWords[sentenceWords.indexOf(word) + 1]
const getPhraseHead = (words: TpWordsState, sentenceWords: Array<WordId>, word: WordId) : WordId => {
  const { head } = words[word]
  return typeof head  === 'string' ? head : nextWord(sentenceWords, word)
}

type GetBaseColor = (words: TpWordsState, sentenceWords: Array<WordId>, word: WordId, level?: number) => Color
const getBaseColor : GetBaseColor = (words, sentenceWords, word, level = 0) => {
  const { role } = words[word]
  return BASE_COLORS[role]
    ? darken(BASE_COLORS[role], level)
    : getBaseColor(words, sentenceWords, getPhraseHead(words, sentenceWords, word), level + 1)
}


const getHighlighting = (words: TpWordsState, sentenceWords: Array<WordId>) : Array<Color> =>
  sentenceWords.map(word => getBaseColor(words, sentenceWords, word))


export default getHighlighting
