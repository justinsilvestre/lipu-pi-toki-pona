import nounPhrase, { realizeNounPhrase } from './nounPhrase'
import type { VocativePhrase } from './grammar'
import punctuate from './punctuate'

export default async function vocativePhrase(words: TpWordsState, wordId: WordId): Promise<VocativePhrase> {
  return {
    head: await nounPhrase(words, wordId)
  }
}

export const realizeVocativePhrase = (vocativePhrase: VocativePhrase) => {
  // return punctuate({ after: ',' }, realizeNounPhrase(vocativePhrase.head))
  return realizeNounPhrase(vocativePhrase.head)
}
