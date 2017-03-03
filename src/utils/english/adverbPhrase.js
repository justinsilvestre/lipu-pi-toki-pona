// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import prepositionalPhrase, { realizePrepositionalPhrase } from './prepositionalPhrase'
import type { AdverbPhrase } from './grammar'
import type { WordsObject } from '../parseTokiPona'
import type { WordId } from '../grammar'
import type { WordTranslation } from '../dictionary'

export default function adverbPhrase(words: WordsObject, wordId: WordId) : AdverbPhrase {
  const word = words[wordId]
  const englishOptionsByPartOfSpeech = lookUpEnglish(word)
  const head : WordTranslation = findByPartsOfSpeech(['adv'], englishOptionsByPartOfSpeech)
  const complements = word.complements || []
  const { prepositionalPhrases = [], adverbPhrases = [] } = adverbModifiers(words, complements) || {}
  const isNegative = Boolean(word.negative)

  return { head, prepositionalPhrases, adverbPhrases, isNegative }
}

function adverbModifiers(words: WordsObject, complements: Array<WordId>) : Object {
  return complements.reduceRight((obj, c) => {
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
            obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(words, english, [complement.prepositionalObject]))
          } else {
            throw new Error('complement needs prepositional object')
          }
          break
        case 'n':
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(words, { text: 'of', pos: 'prep' }, [c]))
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

export const realizeAdverbPhrase = ({ head, prepositionalPhrases = [], adverbPhrases = [], isNegative }: AdverbPhrase) : Array<WordTranslation> => [
  ...adverbPhrases.map(realizeAdverbPhrase).reduce((a, b) => a.concat(b), []),
  ...(isNegative ? [{ text: 'not', pos: 'adv' }] : []),
  head,
  ...prepositionalPhrases.map(realizePrepositionalPhrase).reduce((a, b) => a.concat(b), [])
]
