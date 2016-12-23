// @flow
import { parse } from 'parse-toki-pona'

export type Word = {
  text: string,
  id?: string,
  index: number,
  role: string,
  sentence: number,
  before?: string,
  after?: string,
  head?: number,
  context?: number,
}

export type Sentence = {
  words: Array<Word>,
  index: number,
}


const id = (v: any) => v

export const getText = (word: Word) : string => {
  const { text } = word
  const before = word.before || ''
  const after = word.after || ''
  return [before, text, after].filter(id).join('')
}

// const partsOfSpeech = {
//
// }

export const getIndex = (word: ?Word) : number => word ? word.index : -1

const processWord = (val: (string | Object), index: number, sentence: number) => ({
  ...(typeof val === 'string' ? { text: val, role: 'particle' } : val),
  index,
  sentence,
})

const addIndexes = (sentences: Array<Array<string | Object>>) : Array<Sentence> => sentences
  .reduce(([all, pos: number], words: Array<string | Object>, sentenceIndex: number) => [
    [...all, { words: words.map((w, i) => processWord(w, i + pos, sentenceIndex)), index: sentenceIndex }],
    pos + words.length,
  ], [[], 0])[0]
export const parseAndAddIndexes = (s: string) : Array<Sentence> => addIndexes(parse(s))

export const isComplementOf = (head: Word, word: Word) : bool => head.role !== 'particle' && word.head === head.id
export const isDirectObjectOf = (maybePredicate: Word, maybeDO: Word) =>
  maybePredicate.sentence === maybeDO.sentence
  && maybePredicate.role === 'predicate'
  && maybeDO.role === 'direct_object'
export const isInfinitiveOf = (maybePredicate: Word, maybeInfinitive: Word) =>
  maybePredicate.sentence === maybeInfinitive.sentence
  && maybePredicate.role === 'predicate'
  && maybeInfinitive.role === 'infinitive'
export const isPrepositionalObjectOf = (maybePreposition: Word, maybePO: Word) =>
  maybePreposition.sentence === maybePO.sentence
  && maybePO.role === 'prepositional_object'
  && maybePO.index - maybePreposition.index === 1
export const isSubjectOf = (maybePredicate: Word, maybeSubject: Word) : bool =>
  (maybePredicate.role === 'predicate' && maybeSubject.role === 'subject')
  || ('context' in maybePredicate && maybePredicate.context === maybeSubject.context)
export const isContextOf = (maybePredicate: Word, maybeContext: Word) : bool =>
  (maybePredicate.role === 'predicate')
  && (maybeContext.role === 'context_predicate')
export const isChildOf = ({ index: sentenceIndex }: Sentence, parent: Word, word: Word) : bool =>
  [parent, word].every(e => e.sentence === sentenceIndex)
  && (isComplementOf(parent, word)
  || isDirectObjectOf(parent, word)
  || isInfinitiveOf(parent, word)
  || isPrepositionalObjectOf(parent, word)
  || isSubjectOf(parent, word)
  || isContextOf(parent, word))
export const children = (sentence: Sentence, parent: Word) : Array<Word> => sentence.words.filter((word: Word) => isChildOf(sentence, parent, word))
export const isDescendantOf = (sentence: Sentence, ancestor: Word, word: Word) =>
  isChildOf(sentence, ancestor, word)
  || children(sentence, ancestor).some((child) => isDescendantOf(sentence, child, word))
