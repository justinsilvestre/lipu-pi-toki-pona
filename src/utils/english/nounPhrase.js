// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import { pluralize } from '../rita'
import prepositionalPhrase, { realizePrepositionalPhrase } from './prepositionalPhrase'
import adjectivePhrase, { realizeAdjectivePhrase } from './adjectivePhrase'
import type { WordsObject } from '../parseTokiPona'
import type { WordId, Word } from '../grammar'
import type { NounPhrase, Case, GrammaticalNumber } from './grammar'
import type { WordTranslation } from '../dictionary'
import { getPossiblePartsOfSpeech, DETERMINER_PARTS_OF_SPEECH } from './nounPartsOfSpeech'

const getHead = (word: Word, casus: Case, number: GrammaticalNumber): WordTranslation  => {
  const englishOptionsByPartOfSpeech = lookUpEnglish(word)
  return findByPartsOfSpeech(getPossiblePartsOfSpeech(casus, number), englishOptionsByPartOfSpeech)
}

export default function nounPhrase(words: WordsObject, wordId: WordId, options?: Object = {}) : NounPhrase {
  let { casus = 'OBLIQUE', number = 'SINGULAR' } = options
  const word = words[wordId]
  if ((word.complements || []).some(c => words[c].text === 'mute')) number = 'PLURAL'
  // qualifier - determiner - adjective phrases - noun - prepositional phrases - appositives
  // qualifier - pronoun - conjoined adjective phrases - prepositional phrases
  const head : WordTranslation = options.head || getHead(word, casus, number)
  const complements : Array<WordId> = word.complements || []
  const isPronoun = head.pos.startsWith('pn')
  if (head.pos !== 'n' && !isPronoun && head.pos !=='prop') throw new Error('invalid noun phrase: ' + JSON.stringify(head))
  const isNegative = Boolean(!options.negatedCopula && word.negative)
  const {
    determiner,
    adjectivePhrases = [],
    prepositionalPhrases = [],
    appositives = [],
  } = nounModifiers(words, complements, { number, isPronoun, isNegative }) || {}
  // const determiner = d || (number === 'SINGULAR' && word.pos !== 'prop' ? { text: 'the', pos: 'd' } : undefined)
  return { isPronoun, head, determiner, adjectivePhrases, prepositionalPhrases, appositives, number, or: word.anu }
  // const pronouns = englishOptionsByPartOfSpeech.pn
  // const nouns = englishOptionsByPartOfSpeech.n
  // return (nouns && nouns[0])
  //   || (pronouns && pronouns[0])
  //   || Object.values(englishOptionsByPartOfSpeech)[0][0]
}

function nounModifiers(words: WordsObject, complements: Array<WordId>, options: Object) : Object {
  let obj = {}
  if (options.isNegative === true) obj.determiner = { text: 'no', pos: 'd' }
  return complements.reduceRight((obj, c) => {
    const complement = words[c]
    const englishOptions = lookUpEnglish(complement)
    const possiblePartsOfSpeech = (Object.keys(englishOptions) : any)
    const determinerPos = possiblePartsOfSpeech.find((pos) => DETERMINER_PARTS_OF_SPEECH[options.number].includes(pos))
    if (!options.isPronoun && !obj.determiner && determinerPos) obj.determiner = englishOptions[determinerPos][0]
    else {
      const english : WordTranslation = findByPartsOfSpeech(['adj', 'prep', 'n'], englishOptions)
      switch (english.pos) {
        case 'adj':
          if (options.isPronoun && complement.text === 'mute') break
          obj.adjectivePhrases = (obj.adjectivePhrases || []).concat(adjectivePhrase(words, c))
          // adverb modifiers
          break
        case 'prep':
          if (typeof complement.prepositionalObject !== 'string') throw new Error('complement needs prepositional object')
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(words, c, {
            head: english,
            objectIds: [complement.prepositionalObject],
          }))
          break
        case 'n':
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(words, c, {
            head: { text: 'of', pos: 'prep' },
            objectIds: [c],
          }))
          break
        case 'prop':
          obj.appositives = (obj.appositives || []).concat(nounPhrase(words, c))
          break
        case 'vi':
          //
          break
        // case ''
        default:
        //   throw new Error(`No viable noun translation for ${words[c].text} (${words[c].pos})`)
      }
    }
    return obj
  }, obj)
}

const pl = (head, number, isPronoun) => {
  if (!isPronoun && number === 'PLURAL')
    return { ...head, text: pluralize(head.text), root: head.text }
  else {
    return head
  }
}

export const realizeNounPhrase = ({ head, determiner, adjectivePhrases = [], prepositionalPhrases = [], appositives = [], isPronoun, number }: NounPhrase) : Array<WordTranslation> => [
  ...(determiner ? [determiner] : []),
  ...adjectivePhrases.map(realizeAdjectivePhrase).reduce((a, b) => a.concat(b), []),
  pl(head, number, isPronoun),
  ...appositives.map(realizeNounPhrase).reduce((a, b) => a.concat(b), []),
  ...prepositionalPhrases.map(pp => realizePrepositionalPhrase(pp)).reduce((a, b) => a.concat(b), [])
]
