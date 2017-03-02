// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import type { WordTranslation } from '../dictionary'
import type { WordId } from '../grammar'
import type { WordsObject } from '../parseTokiPona'
import type { VerbPhrase, SubjectPhrase, NounPhrase, AdjectivePhrase } from './grammar'
import nounPhrase, { realizeNounPhrase } from './nounPhrase'
import adjectivePhrase, { realizeAdjectivePhrase } from './adjectivePhrase'
import adverbPhrase, { realizeAdverbPhrase } from './adverbPhrase'
import prepositionalPhrase, { realizePrepositionalPhrase } from './prepositionalPhrase'
import conjoin from './conjoin'
import RiTa, { SINGULAR, PLURAL, FIRST_PERSON, THIRD_PERSON, string } from '../rita'

const realizeSubjectComplement = (englishTranslation: NounPhrase | AdjectivePhrase) : Array<WordTranslation> => {
// const realizeSubjectComplement = (englishTranslation: NounPhrase | AdjectivePhrase | VerbPhrase) : Array<WordTranslation> => {
  if (englishTranslation.head.pos === 'adj') {
    const adjectiveTranslation : AdjectivePhrase = (englishTranslation : any)
    return realizeAdjectivePhrase(adjectiveTranslation)
  } else if (englishTranslation.head.pos === 'n') {
    const nounTranslation : NounPhrase = (englishTranslation : any)
    return realizeNounPhrase(nounTranslation)
  // } else if (englishTranslation.head.pos.startsWith) {
  //   const verbTranslation : VerbPhrase = (englishTranslation : any)
  //   return realizeVerbPhrase(verbTranslation, null, { isInfinitive: true })
  } else {
    throw new Error('Subject complement must be noun or adjective: ' + JSON.stringify(englishTranslation))
  }
}

// findByPartsOfSpeech(complementPartsOfSpeech, lookUpEnglish(words[p]))

const getObjects = (words, word) : Array<WordId> => {
  switch (word.pos) {
    case 'prep':
      if (!(typeof word.prepositionalObject === 'string')) throw new Error('whoops')
      return [word.prepositionalObject]
    case 't':
      return word.directObjects
    default:
      return []
  }
}

// use options to coerce to copula phrase,
// or give different POS priorities
export default function verbPhrase(words: WordsObject, wordId: WordId, options: Object = {}) : VerbPhrase {
  const word = words[wordId]
  const englishOptionsByPartOfSpeech = lookUpEnglish(word)
  // const head = findByPartsOfSpeech(['vc', 'vi', 'vt', 'vm', 'vp'], englishOptionsByPartOfSpeech)
  const head = findByPartsOfSpeech(['vi', 'vt', 'vm', 'vp'], englishOptionsByPartOfSpeech)
  const { subjectPhrase } = options
  const inanimateSubject = subjectPhrase && subjectPhrase.animacy === 'INANIMATE'

  if (inanimateSubject || (head && !['vc', 'vi', 'vt', 'vm', 'vp'].includes(head.pos))) {
  // if (inanimateSubject || head.pos === 'vc' || (head && !['vc', 'vi', 'vt', 'vm', 'vp'].includes(head.pos))) {
    console.log('inanimateSubject', inanimateSubject, 'non-verbal predicate', !['vc', 'vi', 'vt', 'vm', 'vp'].includes(head.pos))
    console.log('head', head, inanimateSubject)
    // return copulaPhrase(words, wordId, head, head.pos === 'vc' ? head : undefined)
    return copulaPhrase(
      words,
      wordId,
      head, // head.pos === 'vc' ? '' : head,
      undefined // head.pos === 'vc' ? head : undefined
    )
  }
  // directObjects
  // prepositionalObject
  // infinitive
  // complements
  // predicate noun/adjective

  const firstPrepositionalPhrases = head.pos === 'vp'
    ? (console.log('VT!!!!!!', head, word) || [prepositionalPhrase(words, head, getObjects(words, word))])
    : []

  const complements = word.complements || []
  const {
    adverbPhrases = [],
    otherPrepositionalPhrases = [],
  } = verbModifiers(words, complements) || {}

  const prepositionalPhrases = firstPrepositionalPhrases.concat(otherPrepositionalPhrases)

// return { head }
  let result : Object = { head, adverbPhrases, prepositionalPhrases }

  if (string(head.text).features().pos === 'md') result.isModal = true

  if (word.directObjects) result.directObjects = word.directObjects.map(dos => nounPhrase(words, dos))
  if (typeof word.infinitive === 'string') {
    // const translations = lookUpEnglish(words[word.infinitive])
    // const nominalPos = Object.keys(translations).find(t => t === 'n' || t.startsWith('pn'))
    // if (nominalPos) {
    //   if (typeof word.infinitive !== 'string') throw new Error('whoops')
    //   result.directObjects = (result.directObjects || []).concat(nounPhrase(words, word.infinitive))
    // } else {
      if (typeof word.infinitive !== 'string') throw new Error('whoops')
      result.infinitive = verbPhrase(words, word.infinitive, {
        [result.isModal ? 'isBareInfinitive' : 'isInfinitive']: true,
      })
    // }
  }
  if (options.isInfinitive) {
    result.isInfinitive = true
  }
  if (options.isBareInfinitive) {
    result.isBareInfinitive = true
  }
  if (word.negative) {
    result.isNegative = true
  }

  return result
}

// export function copulaPhrase(words: WordsObject, wordId: WordId, options: Object = {}) {
//
}
export function copulaPhrase(
  words: WordsObject,
  subjectComplementTokiPonaId: WordId,
  subjectComplementTranslation: WordTranslation,
  copula?: WordTranslation = { text: 'be', pos: 'vi' }
) {
  const isNegative = words[subjectComplementTokiPonaId].negative
  //
  // if (subjectComplementTranslation.pos.startsWith('v')) {
  //   return {
  //     head: copula,
  //     isNegative,
  //     subjectComplements: []
  //   }
  // }

  const getPhrase = subjectComplementTranslation.pos === 'adj' ? adjectivePhrase : nounPhrase

  return {
    head: copula,
    isNegative,
    subjectComplements: [getPhrase(words, subjectComplementTokiPonaId, { negatedCopula: isNegative })],
  }
}

const conjugate = (verbPhrase: VerbPhrase, subject?: SubjectPhrase, externalAuxiliaryVerb) => {
  const verb = verbPhrase.head
  const auxiliaryVerb = externalAuxiliaryVerb || (
    verb.text !== 'be' && verbPhrase.isNegative && !(verbPhrase.isInfinitive || verbPhrase.isBareInfinitive)
    ? { text: 'do', pos: 'v' }
    : undefined
  )
  console.log('conjugating', verb)
  const { isPlural, isFirstPerson } = subject || {}
  const rules = {
    number: isPlural ? PLURAL : SINGULAR,
    person: isFirstPerson ? FIRST_PERSON : THIRD_PERSON,
  }
  // console.log(verb.text, string(subject && subject.head && subject.head.text).features())
  let newText = auxiliaryVerb || verbPhrase.isBareInfinitive || verbPhrase.isModal
    ? verb.text
    : RiTa.conjugate(verb.text, rules)
    console.log(newText)
  if (verbPhrase.isInfinitive) newText = `to ${verb.text}`

  const result = {
    mainVerb: {
      ...verb,
      text: newText,
      root: verb.text,
    }
  }
  if (auxiliaryVerb) result.auxiliaryVerb = {
    text: RiTa.conjugate(auxiliaryVerb.text, rules),
    root: auxiliaryVerb.text,
  }
  return result
}

const flatten = (a, b) => a.concat(b)

export const realizeVerbPhrase = (phrase: VerbPhrase, subject?: SubjectPhrase) : Array<WordTranslation> => {
  const { head, isNegative, adverbPhrases = [], prepositionalPhrases = [], subjectComplements = [], directObjects = [], infinitive } = phrase
  // should make sure d.o. and subj complement arent both present at once?
  const { mainVerb, auxiliaryVerb } = conjugate(phrase, subject)
  return [
    auxiliaryVerb || mainVerb,
    ...(isNegative ? [{ text: 'not', pos: 'adv' }] : []),
    ...(auxiliaryVerb ? [mainVerb] : []),
    ...conjoin(directObjects.map(realizeNounPhrase)),
    ...subjectComplements.map(realizeSubjectComplement).reduce(flatten, []),
    ...(infinitive ? realizeVerbPhrase(infinitive, subject) : []),
    ...adverbPhrases.map(realizeAdverbPhrase).reduce(flatten, []),
    ...prepositionalPhrases.map(realizePrepositionalPhrase).reduce(flatten, []),
  ]
}

function verbModifiers(words: WordsObject, complements: Array<WordId>) : Object {
  return complements.reduceRight((obj, c) => {
    const complement = words[c]
    const englishOptions = lookUpEnglish(complement)
    const possiblePartsOfSpeech = (Object.keys(englishOptions) : any)
    const english = findByPartsOfSpeech(['adv', 'prep'], englishOptions)
    console.log(english)
    switch (english.pos) {
      case 'adv':
        obj.adverbPhrases = (obj.adverbPhrases || []).concat(adverbPhrase(words, c))
        // adverb modifiers
        break
      case 'prep':
        if (typeof complement.prepositionalObject !== 'string') throw new Error('complement needs prepositional object')
        obj.prepositionalPhrases = (obj.prepositionalPhrases || [])
          .concat(prepositionalPhrase(words, english, [complement.prepositionalObject]))
        break
      case 'n':
        obj.prepositionalPhrases = (obj.prepositionalPhrases || [])
          .concat(prepositionalPhrase(words, { text: 'by', pos: 'conj' }, [c]))
        break
      case 'prop':
        //
        break
      // case ''
      default:
      //   throw new Error(`No viable noun translation for ${words[c].text} (${words[c].pos})`)
    }
    return obj
  }, {})
}
