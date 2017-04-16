// @flow
import prepositionalPhrase, { realizePrepositionalPhrase } from './prepositionalPhrase'
import type { AdjectivePhrase } from './grammar'
import type { WordsObject } from '../parseTokiPona'
import type { WordId, Word } from '../grammar'
import adverbPhrase, { realizeAdverbPhrase } from './adverbPhrase'
import type { WordTranslation } from '../dictionary'
import type { Lookup } from '../../actions/lookup'


export default async function adjectivePhrase(lookup: Lookup, wordId: WordId, options: Object = {}) : Promise<AdjectivePhrase> {
  const { words } = lookup
  const word = words[wordId]
  const { enLemma: head } = await lookup.translate(word.lemmaId, ['adj'])
  const complements = word.complements || []
  const isNegative = Boolean(!options.negatedCopula && word.negative)
  const { prepositionalPhrases, adverbPhrases } = await adjectiveModifiers(lookup, complements, { isNegative })

  return { head, prepositionalPhrases, adverbPhrases, isNegative }
}

async function adjectiveModifiers(lookup: Lookup, complements: Array<WordId>, options: Object) : Promise<Object> {
  const { words } = lookup
  const obj = {}
  const complementsWithEnglish = await Promise.all(complements.map(async (c) => {
    const english = await lookup.translate(words[c].lemmaId, ['adv', 'prep'])
    return { c, english }
  }))
  const { prepositionalPhrases = [], adverbPhrases = [] } = complementsWithEnglish.reduceRight((obj, { c, english }) => {
    const complement = words[c]
      switch (english.pos) {
        case 'adv':
          obj.adverbPhrases = (obj.adverbPhrases || []).concat(adverbPhrase(lookup, c))
          // adverb modifiers
          break
        case 'prep':
          if (typeof complement.prepositionalObject === 'string') {
            obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(lookup, c, {
              head: english,
              objectIds: [complement.prepositionalObject],
            }))
          } else {
            throw new Error('complement needs prepositional object')
          }
          break
        case 'n':
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(lookup, c, {
            head: { text: 'of', pos: 'prep' },
            objectIds: [c],
          }))
          break
        case 'prop':
        case 'vi':
          //
          break
        // case ''
        default:
        //   throw new Error(`No viable noun translation for ${words[c].text} (${words[c].pos})`)
      }
    return obj
  }, obj)
  return {
    prepositionalPhrases: await Promise.all(prepositionalPhrases),
    adverbPhrases: await Promise.all(adverbPhrases),
  }
}

export const realizeAdjectivePhrase = ({ head, prepositionalPhrases = [], adverbPhrases = [], isNegative }: AdjectivePhrase) : Array<WordTranslation> => [
  ...adverbPhrases.map(realizeAdverbPhrase).reduce((a, b) => a.concat(b), []),
    ...(isNegative ? [{ text: 'not', pos: 'adv' }] : []),
  head,
  ...prepositionalPhrases.map(pp => realizePrepositionalPhrase(pp)).reduce((a, b) => a.concat(b), [])
]
