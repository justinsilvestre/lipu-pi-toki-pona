// @flow
import type { WordsObject } from '../parseTokiPona'
import type { WordId } from '../grammar'
import type { WordTranslation } from '../dictionary'
import type { PrepositionalPhrase } from './grammar'
import nounPhrase, { realizeNounPhrase } from './nounPhrase'
import conjoin from './conjoin'

export default function prepositionalPhrase(words: WordsObject, preposition: WordTranslation, objectIds: Array<WordId>) : PrepositionalPhrase {
  return {
    preposition,
    objects: objectIds.map(objectId => nounPhrase(words, objectId)),
    // isNegative: preposition
  }
}

export function realizePrepositionalPhrase(prepositionalPhrase: PrepositionalPhrase) : Array<WordTranslation> {
  const { preposition, objects } = prepositionalPhrase
  return [
    preposition,
    ...conjoin(objects.map(object => realizeNounPhrase(object))),
  ]
}
