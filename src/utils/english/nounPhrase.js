// @flow
import { pluralize } from '../rita'
import prepositionalPhrase, { realizePrepositionalPhrase } from './prepositionalPhrase'
import adjectivePhrase, { realizeAdjectivePhrase } from './adjectivePhrase'
import type { TpWordsState, WordId, Word } from '../../selectors/tpWords'
import type { NounPhrase, Case, GrammaticalNumber } from './grammar'
import type { EnWord } from '../../selectors/enWords'
import { getPossiblePartsOfSpeech, DETERMINER_PARTS_OF_SPEECH } from './nounPartsOfSpeech'
import type { Lookup } from '../../actions/lookup'
import { ofWord } from '../../selectors/enWords'

export type Options = {
  head?: EnWord,
  casus?: Case,
  number?: GrammaticalNumber,
}

async function nounPhrase(lookup: Lookup, wordId: WordId, options?: Options = {}): Promise<NounPhrase> {
  const { words } = lookup

  const word = words[wordId]
  let { casus = 'OBLIQUE', number = word.text == 'sina' ? 'PLURAL' : 'SINGULAR' } = options
  if ((word.complements || []).some(c => words[c].text === 'mute')) number = 'PLURAL'
  // qualifier - determiner - adjective phrases - noun - prepositional phrases - appositives
  // qualifier - pronoun - conjoined adjective phrases - prepositional phrases
  const head = options.head || (await lookup.translate(wordId, getPossiblePartsOfSpeech(casus, number))).enWord

  if (!head) throw new Error(`No noun translation found for ${JSON.stringify(word)}`)
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

const getDeterminer = async (lookup, complements, partsOfSpeech): Promise<?{ determinerWord: EnWord, complementId: WordId }> => {
  for (let i = complements.length - 1; i >= 0; i--) {
    const { enWord } = await lookup.translate(complements[i], partsOfSpeech)
    // isDeterminer
    if (enWord && enWord.pos.includes('d')) return { determinerWord: enWord, complementId: complements[i] }
  }
}
async function nounModifiers(lookup: Lookup, complements: Array<WordId>, options: Object) : Promise<Object> {
  const { words } = lookup
  let obj = {}
  if (options.isNegative === true) obj.determiner = Promise.resolve({ text: 'no', pos: 'd' })
  let determiner = obj.determiner
  let determinerComplementId
  if (!determiner && !options.isPronoun) {
    const { determinerWord, complementId } = await(getDeterminer(lookup, complements, DETERMINER_PARTS_OF_SPEECH[options.number])) || {}
    determiner = determinerWord
    determinerComplementId = complementId
    if (determinerWord && !determinerWord.phraseTranslationId) throw new Error('whoops')
  }
  // let determiner = obj.determiner || await(getDeterminer(lookup, complements, DETERMINER_PARTS_OF_SPEECH[options.number]))
  const complementsWithEnglish = await Promise.all(complements.map(async (c) => {
    if (c === determinerComplementId) return null
    const { enWord: english } =
      await lookup.translate(c, ['adj', 'n'])
      || await lookup.translate(c, ['prep'])
      || await lookup.translate(c)
    if (!english) throw new Error(`No noun modifier translation found for ${JSON.stringify(words[c])}`)
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
          head: ofWord(),
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

const pl = (head: EnWord, number: 'SINGULAR' | 'PLURAL', isPronoun: boolean): EnWord => {
  if (!isPronoun && number === 'PLURAL') {
    const result = { id: head.id, before: head.before, after: head.after, pos: head.pos, text: pluralize(head.text) }
    if (head.phraseTranslationId) {
      return ({
        ...result,
        phraseTranslationId: head.phraseTranslationId,
        tpWordId: head.tpWordId,
      }: EnWord)
    } else if (head.lemmaId) {
      return ({
        ...result,
        lemmaId: head.lemmaId
      }: EnWord)
    } else if (head.tpWordId) {
      return ({
        ...result,
        tpWordId: head.tpWordId
      }: EnWord)
    }
    throw new Error ('whoops')
  } else {
    return head
  }
}

export const realizeNounPhrase = ({ head, determiner, adjectivePhrases = [], prepositionalPhrases = [], appositives = [], isPronoun, number }: NounPhrase) : Array<EnWord> => [
  ...(determiner ? [determiner] : []),
  ...adjectivePhrases.map(realizeAdjectivePhrase).reduce((a, b) => a.concat(b), []),
  pl(head, number, isPronoun),
  ...appositives.map(realizeNounPhrase).reduce((a, b) => a.concat(b), []),
  ...prepositionalPhrases.map(pp => realizePrepositionalPhrase(pp)).reduce((a, b) => a.concat(b), [])
]
