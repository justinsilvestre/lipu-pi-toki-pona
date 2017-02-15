// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import RiTa, { SINGULAR, PLURAL, FIRST_PERSON, THIRD_PERSON } from '../rita'
import prepositionalPhrase, { realizePrepositionalPhrase } from './prepositionalPhrase'

export default function nounPhrase(words: WordsObject, wordId: WordId) : NounPhrase {
  const word = words[wordId]
  const englishOptionsByPartOfSpeech = lookUpEnglish(word)
  // qualifier - determiner - adjective phrases - noun - prepositional phrases - appositives
  // qualifier - pronoun - conjoined adjective phrases - prepositional phrases
  const head = findByPartsOfSpeech(['n', 'pn'], englishOptionsByPartOfSpeech)
  // const noun = toNoun(findByPartsOfSpeech(['n', 'pn'], englishOptionsByPartOfSpeech))
  const complements = word.complements || []
  const { determiner, adjectivePhrases = [], prepositionalPhrases = [], appositives = [] } = nounModifiers(words, complements) || {}

  return { head, determiner, adjectivePhrases, prepositionalPhrases, appositives, number: SINGULAR }
  // const pronouns = englishOptionsByPartOfSpeech.pn
  // const nouns = englishOptionsByPartOfSpeech.n
  // return (nouns && nouns[0])
  //   || (pronouns && pronouns[0])
  //   || Object.values(englishOptionsByPartOfSpeech)[0][0]
}

function nounModifiers(words: WordsObject, complements: Array<WordId>) : Object {
  return complements.reduceRight((obj, c) => {
    const complement = words[c]
    const englishOptions = lookUpEnglish(complement)
    const possiblePartsOfSpeech = (Object.keys(englishOptions) : any)
    const determinerPos = possiblePartsOfSpeech.find((pos) => pos.startsWith('d'))
    if (determinerPos) console.log('asdfasdf', determinerPos)
    if (complement.text === 'toki') console.log('asdf', findByPartsOfSpeech(['adj', 'prep', 'n'], englishOptions))
    if (!obj.determiner && determinerPos) obj.determiner = englishOptions[determinerPos][0]
    else {
      const english = findByPartsOfSpeech(['adj', 'prep', 'n'], englishOptions)
      console.log('ENGLISH C', english)
      switch (english.pos) {
        case 'adj':
          obj.adjectivePhrases = (obj.adjectivePhrases || []).concat(english)
          // adverb modifiers
          break
        case 'prep':
          if (!('prepositionalObject' in complement)) throw new Error('complement needs prepositional object')
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(words, english, complement.prepositionalObject))
          break
        case 'n':
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(words, { text: 'of', pos: 'prep' }, c))
          break
        case 'prop':
        case 'vi':
          //
          break
        // case ''
        // default:
        //   throw new Error(`No viable noun translation for ${words[c].text} (${words[c].pos})`)
      }
    }
    return obj
  }, {})
}

export const realizeNounPhrase = ({ head, determiner, adjectivePhrases = [], prepositionalPhrases = [] }: NounPhrase) => [
  ...(determiner ? [determiner] : []),
  ...adjectivePhrases,
  head,
  ...prepositionalPhrases.map(pp => realizePrepositionalPhrase(pp)).reduce((a, b) => a.concat(b), [])
  // ...prepositionalPhrases
]
