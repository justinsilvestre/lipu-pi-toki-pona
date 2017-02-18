// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import prepositionalPhrase, { realizePrepositionalPhrase } from './prepositionalPhrase'
import type { AdjectivePhrase } from './grammar'
import type { WordsObject } from '../parseTokiPona'
import type { WordId } from '../grammar'
import { realizeAdverbPhrase } from './adverbPhrase'
import type { WordTranslation } from '../dictionary'

export default function adjectivePhrase(words: WordsObject, wordId: WordId) : AdjectivePhrase {
  const word = words[wordId]
  const englishOptionsByPartOfSpeech = lookUpEnglish(word)
  const head = findByPartsOfSpeech(['adj'], englishOptionsByPartOfSpeech)
  const complements = word.complements || []
  const { prepositionalPhrases = [], adverbPhrases = [] } = adjectiveModifiers(words, complements) || {}

  return { head, prepositionalPhrases, adverbPhrases }
}

function adjectiveModifiers(words: WordsObject, complements: Array<WordId>) : Object {
  return complements.reduceRight((obj, c) => {
    const complement = words[c]
    const englishOptions = lookUpEnglish(complement)
      const english = findByPartsOfSpeech(['adv', 'prep'], englishOptions)
      switch (english.pos) {
        case 'adv':
          obj.adjectivePhrases = (obj.adjectivePhrases || []).concat(english)
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
  }, {})
}

export const realizeAdjectivePhrase = ({ head, prepositionalPhrases = [], adverbPhrases = [] }: AdjectivePhrase) : Array<WordTranslation> => [
  ...adverbPhrases.map(realizeAdverbPhrase).reduce((a, b) => a.concat(b), []),
  head,
  ...prepositionalPhrases.map(pp => realizePrepositionalPhrase(pp)).reduce((a, b) => a.concat(b), [])
]
