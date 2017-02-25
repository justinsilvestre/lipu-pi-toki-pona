// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import { SINGULAR, pluralize } from '../rita'
import prepositionalPhrase, { realizePrepositionalPhrase } from './prepositionalPhrase'
import adjectivePhrase, { realizeAdjectivePhrase } from './adjectivePhrase'
import type { WordsObject } from '../parseTokiPona'
import type { WordId } from '../grammar'
import type { NounPhrase } from './grammar'
import type { WordTranslation } from '../dictionary'

const RESTRICTED_PRONOUN_PARTS_OF_SPEECH = {
  OBLIQUE_SINGULAR: ['pnio', 'pnso', 'pno', 'pns'],
  OBLIQUE_PLURAL: ['pnpo', 'pno', 'pnp'],
  NOMINATIVE_SINGULAR: ['pnin', 'pnsn', 'pns', 'pnsn'],
  NOMINATIVE_PLURAL: ['pnp', 'pnpn'],
}


const DETERMINER_PARTS_OF_SPEECH = {
  SINGULAR: ['d', 'ds'],
  PLURAL: ['d', 'dp'],
}

const getPossiblePartsOfSpeech = (casus, number) => {
  const restricted = RESTRICTED_PRONOUN_PARTS_OF_SPEECH[`${casus}_${number}`] || []
  return ['n', 'pn', ...restricted]
}

export default function nounPhrase(words: WordsObject, wordId: WordId, options?: Object = {}) : NounPhrase {
  let { casus = 'OBLIQUE', number = 'SINGULAR' } = options
  const word = words[wordId]
  if ((word.complements || []).some(c => words[c].text === 'mute')) number = 'PLURAL'
  const englishOptionsByPartOfSpeech = lookUpEnglish(word)
  // qualifier - determiner - adjective phrases - noun - prepositional phrases - appositives
  // qualifier - pronoun - conjoined adjective phrases - prepositional phrases
  const head : WordTranslation = findByPartsOfSpeech(getPossiblePartsOfSpeech(casus, number), englishOptionsByPartOfSpeech)
  // const noun = toNoun(findByPartsOfSpeech(['n', 'pn'], englishOptionsByPartOfSpeech))
  const complements : Array<WordId> = word.complements || []
  const isPronoun = head.pos !== 'n'
  const isNegative = Boolean(!options.negatedCopula && word.negative)
  console.log('isnegative?', word.text, isNegative)
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
  if (options.isNegative === true) obj.determiner = console.log('NOPE!!!!') || { text: 'no', pos: 'd' }
  return complements.reduceRight((obj, c) => {
    const complement = words[c]
    const englishOptions = lookUpEnglish(complement)
    const possiblePartsOfSpeech = (Object.keys(englishOptions) : any)
    const determinerPos = possiblePartsOfSpeech.find((pos) => DETERMINER_PARTS_OF_SPEECH[options.number].includes(pos))
    if (!options.isPronoun && !obj.determiner && determinerPos) obj.determiner = englishOptions[determinerPos][0]
    else {
      const english : WordTranslation = findByPartsOfSpeech(['adj', 'prep', 'n'], englishOptions)
      console.log('ENGLISH C', english)
      switch (english.pos) {
        case 'adj':
          if (options.isPronoun && complement.text === 'mute') break
          obj.adjectivePhrases = (obj.adjectivePhrases || []).concat(adjectivePhrase(words, c))
          // adverb modifiers
          break
        case 'prep':
          if (typeof complement.prepositionalObject !== 'string') throw new Error('complement needs prepositional object')
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(words, english, complement.prepositionalObject))
          break
        case 'n':
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(words, { text: 'of', pos: 'prep' }, c))
          break
        case 'prop':
          obj.appositives = (obj.appositives || []).concat(nounPhrase(words, c))
          break
        case 'vi':
          //
          break
        // case ''
        // default:
        //   throw new Error(`No viable noun translation for ${words[c].text} (${words[c].pos})`)
      }
    }
    return obj
  }, obj)
}

const pl = (head, number, isPronoun) => {
  if (!isPronoun && number == 'PLURAL')
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
