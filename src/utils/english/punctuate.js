// @flow
import { head, last } from 'ramda'
import type { EnWord } from '../grammar'

type Punctuation = {
  before?: string,
  after?: string,
}

const punctuate = (punctuation: Punctuation, EnWords: Array<EnWord>) : Array<EnWord> => {
  const lastIndex = EnWords.length - 1
  const { before, after } = punctuation
  return EnWords.map((w, i) => {
    const word = { ...w }
    if (i === 0) word.before = before
    if (i === lastIndex) word.after = after
    return word
  })
}

export default punctuate
