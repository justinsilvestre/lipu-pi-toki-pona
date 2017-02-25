// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import prepositionalPhrase, { realizePrepositionalPhrase } from './prepositionalPhrase'
import type { AdjectivePhrase } from './grammar'
import type { WordsObject } from '../parseTokiPona'
import type { WordId } from '../grammar'
import adverbPhrase, { realizeAdverbPhrase } from './adverbPhrase'
import type { WordTranslation } from '../dictionary'

export default function adjectivePhrase(words: WordsObject, wordId: WordId, options: Object = {}) : AdjectivePhrase {
  const word = words[wordId]
  const englishOptionsByPartOfSpeech = lookUpEnglish(word)
  const head = findByPartsOfSpeech(['adj'], englishOptionsByPartOfSpeech)
  const complements = word.complements || []
  const isNegative = Boolean(!options.negatedCopula && word.negative)
  const { prepositionalPhrases = [], adverbPhrases = [] } = adjectiveModifiers(words, complements, { isNegative }) || {}

  return { head, prepositionalPhrases, adverbPhrases, isNegative }
}

function adjectiveModifiers(words: WordsObject, complements: Array<WordId>, options: Object) : Object {
  const obj = {}
  const modifiers = complements.reduceRight((obj, c) => {
    const complement = words[c]
    const englishOptions = lookUpEnglish(complement)
      const english = findByPartsOfSpeech(['adv', 'prep'], englishOptions)
      switch (english.pos) {
        case 'adv':
          obj.adverbPhrases = (obj.adverbPhrases || []).concat(adverbPhrase(words, c))
          // adverb modifiers
          break
        case 'prep':
          if (typeof complement.prepositionalObject === 'string') {
            obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(words, english, complement.prepositionalObject))
          } else {
            throw new Error('complement needs prepositional object')
          }
          break
        case 'n':
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(words, { text: 'of', pos: 'prep' }, c))
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
  return modifiers
}

export const realizeAdjectivePhrase = ({ head, prepositionalPhrases = [], adverbPhrases = [], isNegative }: AdjectivePhrase) : Array<WordTranslation> => [
  ...adverbPhrases.map(realizeAdverbPhrase).reduce((a, b) => a.concat(b), []),
    ...(isNegative ? [{ text: 'not', pos: 'adv' }] : []),
  head,
  ...prepositionalPhrases.map(pp => realizePrepositionalPhrase(pp)).reduce((a, b) => a.concat(b), [])
]
