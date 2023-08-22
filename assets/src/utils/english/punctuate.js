// @flow
import { head, last } from 'ramda'
import type { EnWord } from '../../selectors/enWords'

type Punctuation = {
  before?: string,
  after?: string,
}

const punctuate = (punctuation: Punctuation, wordTranslations: Array<EnWord>) : Array<EnWord> => {
  const lastIndex = wordTranslations.length - 1
  const { before, after } = punctuation
  return wordTranslations.map((w, i) => {
    const word: EnWord = { ...w }
    if (i === 0) word.before = before
    if (i === lastIndex) word.after = after
    return word
  })
}

export default punctuate
