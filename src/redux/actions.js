// @flow
import { parseAndAddIndexes } from '../utils/grammar'
import type { Sentence, Word } from '../utils/grammar'

export type Action =
  { type: 'PARSE_SENTENCES', tpSentences: Array<Sentence> }
  | { type: 'WORD_MOUSE_ENTER', word: Word }
  | { type: 'WORD_MOUSE_LEAVE', word: Word }
  | { type: 'WORD_MOUSE_DOWN', word: Word }
  | { type: 'WORD_MOUSE_UP', word: Word }
  | { type: 'WORD_CLICK', word: Word }
  | { type: 'SELECT_WORDS' }
  | { type: 'DELIMIT_PENDING_SELECTION', start: Word, end: Word }
  | { type: 'TRANSLATE_SENTENCES', enSentences: Array<Array<string>> }

export const parseSentences = (text: string) : Action => ({
  type: 'PARSE_SENTENCES',
  tpSentences: parseAndAddIndexes(text)
})

const sortByIndex = (word1: Word, word2: Word) : Array<Word> =>
  [word1, word2].sort(({ index: i1 }, { index: i2 }) => i1 < i2 ? -1 : 1)

export const wordMouseEnter = (word: Word) : Action => ({
  type: 'WORD_MOUSE_ENTER',
  word,
})
export const wordMouseLeave = (word: Word) : Action => ({
  type: 'WORD_MOUSE_LEAVE',
  word,
})
export const wordMouseDown = (word: Word) : Action => ({
  type: 'WORD_MOUSE_DOWN',
  word,
})
export const wordMouseUp = (word: Word) : Action => ({
  type: 'WORD_MOUSE_UP',
  word,
})
export const wordClick = (word: Word) : Action => ({
  type: 'WORD_CLICK',
  word,
})

export const delimitPendingSelection = (down: Word, up: Word) : Action  => {
  const [start, end] = sortByIndex(down, up)
  return {
    type: 'DELIMIT_PENDING_SELECTION',
    start,
    end,
  }
}
export const selectWords = () : Action => ({
  type: 'SELECT_WORDS',
})

export const translateSentences = (enSentences: Array<Array<{ text: string, pos: string }>>) : Action => ({
  type: 'TRANSLATE_SENTENCES',
  enSentences,
})
