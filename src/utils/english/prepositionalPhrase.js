// @flow
import type { WordsObject } from '../parseTokiPona'
import type { WordId } from '../grammar'
import type { WordTranslation } from '../dictionary'
import type { PrepositionalPhrase } from './grammar'
import nounPhrase, { realizeNounPhrase } from './nounPhrase'

export default function prepositionalPhrase(words: WordsObject, preposition: WordTranslation, objectId: WordId) : PrepositionalPhrase {
  return {
    preposition,
    object: nounPhrase(words, objectId),
  }
}

export function realizePrepositionalPhrase(prepositionalPhrase: PrepositionalPhrase) {
  const { preposition, object } = prepositionalPhrase
  return [
    preposition,
    ...realizeNounPhrase(object)
  ]
}
