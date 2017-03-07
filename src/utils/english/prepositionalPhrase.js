// @flow
import type { WordsObject } from '../parseTokiPona'
import type { WordId } from '../grammar'
import type { WordTranslation } from '../dictionary'
import type { PrepositionalPhrase } from './grammar'
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import nounPhrase, { realizeNounPhrase } from './nounPhrase'
import conjoin from './conjoin'

// export default function prepositionalPhrase(words: WordsObject, preposition: WordTranslation, objectIds: Array<WordId>) : PrepositionalPhrase {
export default function prepositionalPhrase(words: WordsObject, wordId: WordId, options: Object = {}) : PrepositionalPhrase {
  const word = words[wordId]
  const head: WordTranslation = options.preposition || findByPartsOfSpeech(['prep'], lookUpEnglish(word))

  let objectIds: Array<WordId> = options.objectIds
  if (!options.objectIds) {
    if (typeof word.prepositionalObject !== 'string') throw new Error('whoops')
    objectIds = [word.prepositionalObject]
  }

  return {
    head,
    objects: objectIds.map(objectId => nounPhrase(words, objectId)),
    // isNegative: preposition
  }
}

export function realizePrepositionalPhrase(phrase: PrepositionalPhrase) : Array<WordTranslation> {
  const { head, objects } = phrase
  return [
    head,
    ...conjoin(objects.map(object => realizeNounPhrase(object))),
  ]
}
