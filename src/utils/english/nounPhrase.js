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
import type { Lookup } from '../../actions/lookup'

const getHead = (word: Word, casus: Case, number: GrammaticalNumber): WordTranslation  => {
  const englishOptionsByPartOfSpeech = lookUpEnglish(word)
  return findByPartsOfSpeech(getPossiblePartsOfSpeech(casus, number), englishOptionsByPartOfSpeech)
}

async function nounPhrase(lookup: Lookup, wordId: WordId, options?: Object = {}): Promise<NounPhrase> {
  const { words } = lookup

  let { casus = 'OBLIQUE', number = 'SINGULAR' } = options
  const word = words[wordId]
  if ((word.complements || []).some(c => words[c].text === 'mute')) number = 'PLURAL'
  // qualifier - determiner - adjective phrases - noun - prepositional phrases - appositives
  // qualifier - pronoun - conjoined adjective phrases - prepositional phrases
  // const head : WordTranslation = options.head || getHead(word, casus, number)
  console.log("lookup??")
  let t
  try {

    t = await(lookup.translate(word.lemmaId, getPossiblePartsOfSpeech(casus, number)))
  } catch (err) {
    console.error('lookup failed!!', err)
  }
  const { enLemma } = t
  console.log('T!!', t, word)
  console.log("-----------lookup")

  const head : WordTranslation = options.head || enLemma
  const complements : Array<WordId> = word.complements || []
  const isPronoun = head.pos.startsWith('pn')
  if (head.pos !== 'n' && !isPronoun && head.pos !=='prop') throw new Error('invalid noun phrase: ' + JSON.stringify(head))
  const isNegative = Boolean(!options.negatedCopula && word.negative)
  const {
    determiner,
    adjectivePhrases,
    prepositionalPhrases,
    appositives,
  } = await nounModifiers(lookup, complements, { number, isPronoun, isNegative })
  // const determiner = d || (number === 'SINGULAR' && word.pos !== 'prop' ? { text: 'the', pos: 'd' } : undefined)
  return { isPronoun, head, determiner, adjectivePhrases, prepositionalPhrases, appositives, number, or: word.anu }
  // const pronouns = englishOptionsByPartOfSpeech.pn
  // const nouns = englishOptionsByPartOfSpeech.n
  // return (nouns && nouns[0])
  //   || (pronouns && pronouns[0])
  //   || Object.values(englishOptionsByPartOfSpeech)[0][0]
}
console.log('nounPhrase', nounPhrase)
export default nounPhrase

async function nounModifiers(lookup: Lookup, complements: Array<WordId>, options: Object) : Promise<Object> {
  const { words } = lookup
  let obj = {}
  if (options.isNegative === true) obj.determiner = Promise.resolve({ text: 'no', pos: 'd' })
  const {
    determiner = Promise.resolve(null),
    adjectivePhrases = [],
    prepositionalPhrases = [],
    appositives = [],
  } = complements.reduceRight((obj, c) => {
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
          obj.adjectivePhrases = (obj.adjectivePhrases || []).concat(adjectivePhrase(lookup, c))
          // adverb modifiers
          break
        case 'prep':
          if (typeof complement.prepositionalObject !== 'string') throw new Error('complement needs prepositional object')
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(lookup, c, {
            head: english,
            objectIds: [complement.prepositionalObject],
          }))
          break
        case 'n':
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(lookup, c, {
            head: { text: 'of', pos: 'prep' },
            objectIds: [c],
          }))
          break
        case 'prop':
          obj.appositives = (obj.appositives || []).concat(nounPhrase(lookup, c))
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

  return {
    determiner: await determiner,
    adjectivePhrases: await Promise.all(adjectivePhrases),
    prepositionalPhrases: await Promise.all(prepositionalPhrases),
    appositives: await Promise.all(appositives),
  }
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
