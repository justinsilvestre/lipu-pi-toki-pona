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
import { ANIMATE_SUBJECT_VERBS } from '../tokiPonaSemanticGroups'
import RiTa, { SINGULAR, PLURAL, FIRST_PERSON, THIRD_PERSON, string } from '../rita'

const realizeSubjectComplement = (englishTranslation: NounPhrase | AdjectivePhrase) : Array<WordTranslation> => {
  if (englishTranslation.head.pos === 'adj') {
    const adjectiveTranslation : AdjectivePhrase = (englishTranslation : any)
    return realizeAdjectivePhrase(adjectiveTranslation)
  } else if (englishTranslation.head.pos === 'n') {
    const nounTranslation : NounPhrase = (englishTranslation : any)
    return realizeNounPhrase(nounTranslation)
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
  const head = findByPartsOfSpeech(['vi', 'vt', 'vm', 'vc', 'vp'], englishOptionsByPartOfSpeech)
  const { subjectPhrase } = options
  const inanimateSubject = subjectPhrase && subjectPhrase.animacy === 'INANIMATE'

  if (
    (inanimateSubject && ANIMATE_SUBJECT_VERBS.includes(word.text)) // properly, primary text
    || (head && !['vc', 'vi', 'vt', 'vm', 'vp'].includes(head.pos))
  ) {
    return copulaPhrase(words, wordId, { subjectComplements: [head], inanimateSubject }
    )
  } else if (head.pos === 'vc') {
    return copulaPhrase(words, wordId, { copula: head, inanimateSubject })
  }

  // those that are part of head's translation, rather than modifiers'
  const firstPrepositionalPhrases = head.pos === 'vp'
    ? (console.log('VT!!!!!!', head, word) || [prepositionalPhrase(words, head, getObjects(words, word))])
    : []

  const complements = word.complements || []
  const {
    adverbPhrases = [],
    prepositionalPhrases: otherPrepositionalPhrases = [],
  } = verbModifiers(words, complements) || {}

  const prepositionalPhrases = firstPrepositionalPhrases.concat(otherPrepositionalPhrases)

  console.log(word.text + ' prepositional', head, prepositionalPhrases)

  let result : Object = { head, adverbPhrases, prepositionalPhrases }

  if (string(head.text).features().pos === 'md') result.isModal = true

  console.log(word.text, word.directObjects)

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

const getSubjectComplement = (subjectComplement) => subjectComplement.pos === 'adj' ? adjectivePhrase : nounPhrase
// copula phrases come from predicate nouns, and from tp verb phrases whose head translates to 'vc's.
export function copulaPhrase(words: WordsObject, wordId: WordId, options: Object = {}) {
  // either wordId is for copula or for subject complements.
  // should throw an error if combination doesn't make sense (leaves something missing)?
  const word = words[wordId]
  const tokiPonaInfinitive = word.infinitive
  const infinitiveTranslations = tokiPonaInfinitive ? lookUpEnglish(words[tokiPonaInfinitive]) : {}
  const predicateInfinitive = tokiPonaInfinitive && // does this translate best to a noun?
    (options.inanimateSubject && ANIMATE_SUBJECT_VERBS.includes(words[tokiPonaInfinitive].text)) // properly, primary text
    || (!['vc', 'vi', 'vt', 'vm', 'vp'].some(pos => pos in infinitiveTranslations))

    console.log('copula: ' + word.text, 'infinitive?', words[tokiPonaInfinitive], 'predicateInfinitive?'. predicateInfinitive)

    //? options.inanimateSubject && ANIMATE_SUBJECT_VERBS.includes(words[tokiPonaInfinitive].text)
    //?X words[tokiPonaInfinitive].pos.startsWith('v')


  const isNegative = word.negative
  const copula = options.copula || { text: 'be', pos: 'vi' }
  console.log(copula.text)
  console.log('predicateInfinitive', predicateInfinitive, words[tokiPonaInfinitive])
  const subjectComplements: Array<WordTranslation> = (options.subjectComplements
    && options.subjectComplements.map(sc => getSubjectComplement(sc)(words, wordId, { negatedCopula: isNegative}))
  ) || (
    predicateInfinitive
    ? [getSubjectComplement(tokiPonaInfinitive)(words, tokiPonaInfinitive)]
    : []
  )

  const result = {
    head: copula,
    isNegative,
    // subjectComplements: [getPhrase(words, wordId, { negatedCopula: isNegative })],
    subjectComplements,
  }
  if (!predicateInfinitive) result.infinitive = verbPhrase(words, tokiPonaInfinitive, { isInfinitive: true })
  return result
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

  if (verbPhrase.head.text.includes('know')) console.log(verbPhrase.head.text, result, verbPhrase)
  console.log(verbPhrase.head.text, result, verbPhrase)
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
    ...(infinitive ? realizeVerbPhrase(infinitive, subject) : []),
    ...conjoin(directObjects.map(realizeNounPhrase)),
    ...subjectComplements.map(realizeSubjectComplement).reduce(flatten, []),
    ...adverbPhrases.map(realizeAdverbPhrase).reduce(flatten, []),
    ...prepositionalPhrases.map(realizePrepositionalPhrase).reduce(flatten, []),
  ]
}

function verbModifiers(words: WordsObject, complements: Array<WordId>) : Object {
  return complements.reduceRight((obj, c) => {
    const complement = words[c]
    console.log('COMPLEMENT???', complement)
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
