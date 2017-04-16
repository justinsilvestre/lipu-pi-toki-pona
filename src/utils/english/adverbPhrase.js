// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import prepositionalPhrase, { realizePrepositionalPhrase } from './prepositionalPhrase'
import type { AdverbPhrase } from './grammar'
import type { WordsObject } from '../parseTokiPona'
import type { WordId } from '../grammar'
import type { WordTranslation } from '../dictionary'
import type { Lookup } from '../../actions/lookup'

export default async function adverbPhrase(lookup: Lookup, wordId: WordId) : Promise<AdverbPhrase> {
  const { words } = lookup
  const word = words[wordId]
  const englishOptionsByPartOfSpeech = lookUpEnglish(word)
  const head : WordTranslation = findByPartsOfSpeech(['adv'], englishOptionsByPartOfSpeech)
  const complements = word.complements || []
  const { prepositionalPhrases, adverbPhrases } = await adverbModifiers(lookup, complements) || {}
  const isNegative = Boolean(word.negative)

  return { head, prepositionalPhrases, adverbPhrases, isNegative }
}

async function adverbModifiers(lookup: Lookup, complements: Array<WordId>) : Promise<Object> {
  const { words } = lookup
  const { prepositionalPhrases = [], adverbPhrases = [] } = complements.reduceRight((obj, c) => {
    const complement = words[c]
    const englishOptions = lookUpEnglish(complement)
      const english = findByPartsOfSpeech(['adv', 'prep'], englishOptions)
      switch (english.pos) {
        case 'adv':
          obj.adverbPhrases = (obj.adverbPhrases || []).concat(english)
          // adverb modifiers
          break
        case 'prep':
          if (typeof complement.prepositionalObject === 'string') {
            // obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(lookup, english, [complement.prepositionalObject]))
            obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(lookup, c, {
              head: english,
              objectIds: [complement.prepositionalObject]
            }))
          } else {
            throw new Error('complement needs prepositional object')
          }
          break
        case 'n':
        // obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(lookup, { text: 'of', pos: 'prep' }, [c]))
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
  }, {})
  return {
    prepositionalPhrases: await Promise.all(prepositionalPhrases),
    adverbPhrases: await Promise.all(adverbPhrases),
  }
}

export const realizeAdverbPhrase = ({ head, prepositionalPhrases = [], adverbPhrases = [], isNegative }: AdverbPhrase) : Array<WordTranslation> => [
  ...adverbPhrases.map(realizeAdverbPhrase).reduce((a, b) => a.concat(b), []),
  ...(isNegative ? [{ text: 'not', pos: 'adv' }] : []),
  head,
  ...prepositionalPhrases.map(realizePrepositionalPhrase).reduce((a, b) => a.concat(b), [])
]
