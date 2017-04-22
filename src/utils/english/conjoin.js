// @flow
import type { EnWord } from '../../selectors/enWords'
import { or, and } from '../../selectors/enWords'

export default function conjoin(realizedPhrases: Array<Array<EnWord>>) : Array<EnWord> {
  return realizedPhrases.reduce((conjoined, phrase, i) => {
    return [...conjoined, ...(i > 0 ? [phrase.or ? or() : and(), ...phrase] : phrase)]
  }, [])
}
