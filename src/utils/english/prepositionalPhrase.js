// @flow
import type { WordsObject } from '../parseTokiPona'
import type { WordId, Word } from '../grammar'
import type { WordTranslation } from '../dictionary'
import type { PrepositionalPhrase } from './grammar'
import nounPhrase, { realizeNounPhrase } from './nounPhrase'
import conjoin from './conjoin'
import type { Lookup } from '../../actions/lookup'

export default async function prepositionalPhrase(lookup: Lookup, wordId: WordId, options: Object = {}) : Promise<PrepositionalPhrase> {
  const { words } = lookup
  const word = words[wordId]
  const head: WordTranslation = options.head || await(lookup.translate(word.lemmaId, ['prep'])).enLemma

  let objectIds: Array<WordId> = options.objectIds
  if (!options.objectIds) {
    if (typeof word.prepositionalObject !== 'string') throw new Error('whoops')
    objectIds = [word.prepositionalObject]
  }

  return {
    head,
    objects: await Promise.all(objectIds.map(objectId => nounPhrase(lookup, objectId))),
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
