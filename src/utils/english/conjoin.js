// @flow
import type { WordTranslation } from '../dictionary'

const and = () => ({ text: 'and', pos: 'conj' })
const or = () => ({ text: 'or', pos: 'conj' })

export default function conjoin(realizedPhrases: Array<Array<WordTranslation>>) {
  return realizedPhrases.reduce((conjoined, phrase, i) => {
    return conjoined.concat(i > 0 ? [phrase.or ? or() : and(), ...phrase] : phrase)
  }, [])
}
