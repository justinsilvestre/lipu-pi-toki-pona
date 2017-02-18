import nounPhrase, { realizeNounPhrase } from './nounPhrase'
import punctuate from './punctuate'

export default function vocativePhrase (words: WordsObject, wordId: WordId) {
  return {
    head: nounPhrase(words, wordId)
  }
}

export const realizeVocativePhrase = (vocativePhrase: VocativePhrase) => {
  return punctuate({ after: ',' }, realizeNounPhrase(vocativePhrase.head))
}
