// @flow
import type { EnWord } from '../grammar'
import { OR, AND } from './grammar'

export default function conjoin(realizedPhrases: Array<Array<EnWord>>) : Array<EnWord> {
  return realizedPhrases.reduce((conjoined, phrase, i) => {
    return conjoined.concat(i > 0 ? [phrase.or ? OR : AND, ...phrase] : phrase)
  }, [])
}
