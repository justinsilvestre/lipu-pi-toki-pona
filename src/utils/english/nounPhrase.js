// @flow
import { pluralize } from '../rita'
import prepositionalPhrase, { realizePrepositionalPhrase } from './prepositionalPhrase'
import adjectivePhrase, { realizeAdjectivePhrase } from './adjectivePhrase'
import type { WordsObject } from '../parseTokiPona'
import type { WordId, Word } from '../grammar'
import type { NounPhrase, Case, GrammaticalNumber } from './grammar'
import type { WordTranslation } from '../dictionary'
import { getPossiblePartsOfSpeech, DETERMINER_PARTS_OF_SPEECH } from './nounPartsOfSpeech'
import type { Lookup } from '../../actions/lookup'

async function nounPhrase(lookup: Lookup, wordId: WordId, options?: Object = {}): Promise<NounPhrase> {
  const { words } = lookup

  const word = words[wordId]
  let { casus = 'OBLIQUE', number = word.text == 'sina' ? 'PLURAL' : 'SINGULAR' } = options
  if ((word.complements || []).some(c => words[c].text === 'mute')) number = 'PLURAL'
  // qualifier - determiner - adjective phrases - noun - prepositional phrases - appositives
  // qualifier - pronoun - conjoined adjective phrases - prepositional phrases
  const { enLemma } = await(lookup.translate(word.lemmaId, getPossiblePartsOfSpeech(casus, number)))

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
}
export default nounPhrase

const getDeterminer = async (lookup, complements, partsOfSpeech) => {
  for (let i = complements.length - 1; i >= 0; i--) {
    const { enLemma } = await lookup.translate(lookup.words[complements[i]].lemmaId, partsOfSpeech)
    if (enLemma) return { determinerLemma: enLemma, complementId: complements[i] }
  }
}
async function nounModifiers(lookup: Lookup, complements: Array<WordId>, options: Object) : Promise<Object> {
  const { words } = lookup
  let obj = {}
  if (options.isNegative === true) obj.determiner = Promise.resolve({ text: 'no', pos: 'd' })
  let determiner = obj.determiner
  let determinerComplementId
  if (!determiner && !options.isPronoun) {
    const { determinerLemma, complementId } = await(getDeterminer(lookup, complements, DETERMINER_PARTS_OF_SPEECH[options.number])) || {}
    determiner = determinerLemma
    determinerComplementId = complementId
  }
  // let determiner = obj.determiner || await(getDeterminer(lookup, complements, DETERMINER_PARTS_OF_SPEECH[options.number]))
  const complementsWithEnglish = await Promise.all(complements.map(async (c) => {
    if (c === determinerComplementId) return null
    const { enLemma: english } =
      await lookup.translate(words[c].lemmaId, ['adj', 'n'])
      || await lookup.translate(words[c].lemmaId, ['prep'])
      || await lookup.translate(words[c].lemmaId)
    if (!english) { return console.log("NO ENGLISH!!!", words[c]) }
    return { c, english }
  }))
  let {
    adjectivePhrases = [],
    prepositionalPhrases = [],
    appositives = [],
  } = complementsWithEnglish.reduceRight((obj, comp) => {
    if (!comp) return obj
    const { c, english } = comp
    const complement = words[c]
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
