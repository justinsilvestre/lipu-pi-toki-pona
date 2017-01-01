// @flow
import type { Sentence, Word } from './grammar'
import { isComplementOf } from './grammar'

export type Color = [number, number, number]

const baseColor = (h) => [h, 55, 60]

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

const findComplementHead = (sentence, complement) : Word => sentence.words.find(w => isComplementOf(w, complement)) || complement // default just for typechecking: if word is complement, guaranteed to find.
const PREPOSED_PARTICLE_ROLES = ['compound_complement_particle', 'indicative_particle', 'optative_particle']
const isPreposedParticle = (word: Word) : boolean => PREPOSED_PARTICLE_ROLES.includes(word.role)
const nextWord = (sentence: Sentence, word: Word) : Word => sentence.words[sentence.words.indexOf(word) + 1]
const getPhraseHead = (sentence: Sentence, word: Word) : Word => (
  isPreposedParticle(word)
    ? nextWord(sentence, word)
    : findComplementHead(sentence, word)
)
const getBaseColor = (sentence: Sentence, word: Word, level: number) : Color =>
  BASE_COLORS[word.role]
    ? darken(BASE_COLORS[word.role], level)
    : getBaseColor(sentence, getPhraseHead(sentence, word), level + 1)

const sentenceColors = (sentence: Sentence) =>
  sentence.words.reduce((colors, word) => [
    ...colors,
    getBaseColor(sentence, word, 0),
  ], [])

const getHighlighting = (sentences: Array<Sentence>) : Array<Color> =>
  sentences.map(sentenceColors).reduce((a, b) => a.concat(b), [])

export default getHighlighting
