// @flow
import { head, last } from 'ramda'
import type { WordTranslation } from '../dictionary'

type Punctuation = {
  before?: string,
  after?: string,
}

const punctuate = (punctuation: Punctuation, wordTranslations: Array<WordTranslation>) : Array<WordTranslation> => {
  const first = head(wordTranslations)
  const final = last(wordTranslations)
  const { before, after } = punctuation
  console.log(punctuation, wordTranslations)
  return [
    { ...first, ...(punctuation.before ? { before } : null) },
    ...wordTranslations.slice(1, wordTranslations.length - 1),
    { ...final, ...(punctuation.after ? { after } : null) },
  ]
}

export default punctuate
