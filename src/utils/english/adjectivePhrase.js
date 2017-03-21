// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import prepositionalPhrase, { realizePrepositionalPhrase } from './prepositionalPhrase'
import type { AdjectivePhrase } from './grammar'
import type { WordsObject } from '../parseTokiPona'
import type { WordId, Word } from '../grammar'
import adverbPhrase, { realizeAdverbPhrase } from './adverbPhrase'
import type { WordTranslation } from '../dictionary'

const getHead = (word: Word): WordTranslation  => {
  const englishOptionsByPartOfSpeech = lookUpEnglish(word)
  return findByPartsOfSpeech(['adj'], englishOptionsByPartOfSpeech)
}

export default function adjectivePhrase(words: WordsObject, wordId: WordId, options: Object = {}) : AdjectivePhrase {
  const word = words[wordId]
  const head = getHead(word)
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
            obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(words, c, {
              head: english,
              objectIds: [complement.prepositionalObject],
            }))
          } else {
            throw new Error('complement needs prepositional object')
          }
          break
        case 'n':
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(words, c, {
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
  return modifiers
}

export const realizeAdjectivePhrase = ({ head, prepositionalPhrases = [], adverbPhrases = [], isNegative }: AdjectivePhrase) : Array<WordTranslation> => [
  ...adverbPhrases.map(realizeAdverbPhrase).reduce((a, b) => a.concat(b), []),
    ...(isNegative ? [{ text: 'not', pos: 'adv' }] : []),
  head,
  ...prepositionalPhrases.map(pp => realizePrepositionalPhrase(pp)).reduce((a, b) => a.concat(b), [])
]
