// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import type { WordTranslation } from '../dictionary'
import type { WordId } from '../grammar'
import type { WordsObject } from '../parseTokiPona'
import type { VerbPhrase, SubjectPhrase, NounPhrase, AdjectivePhrase, PrepositionalPhrase, SubjectComplementPhrase } from './grammar'
import nounPhrase, { realizeNounPhrase } from './nounPhrase'
import adjectivePhrase, { realizeAdjectivePhrase } from './adjectivePhrase'
import adverbPhrase, { realizeAdverbPhrase } from './adverbPhrase'
import prepositionalPhrase, { realizePrepositionalPhrase } from './prepositionalPhrase'
import conjoin from './conjoin'
import conjugate from './conjugate'
import { ANIMATE_SUBJECT_VERBS } from '../tokiPonaSemanticGroups'
import { string } from '../rita'

const realizeSubjectComplement = (englishTranslation: NounPhrase | AdjectivePhrase | PrepositionalPhrase) : Array<WordTranslation> => {
  if (englishTranslation.head.pos === 'adj') {
    const adjectiveTranslation : AdjectivePhrase = (englishTranslation : any)
    return realizeAdjectivePhrase(adjectiveTranslation)
  } else if (englishTranslation.head.pos === 'n' || englishTranslation.head.pos === 'prop') {
    const nounTranslation : NounPhrase = (englishTranslation : any)
    return realizeNounPhrase(nounTranslation)
  } else if (englishTranslation.head.pos === 'prep') {
    const prepositionalTranslation: PrepositionalPhrase = (englishTranslation : any)
    return realizePrepositionalPhrase(prepositionalTranslation)
  } else {
    throw new Error('Subject complement must be noun, adjective, or prepositional phrase: ' + JSON.stringify(englishTranslation))
  }
}

const getObjects = (words, word) : Array<WordId> => {
  switch (word.pos) {
    case 'prep':
      if (typeof word.prepositionalObject !== 'string') throw new Error('whoops')
      return [word.prepositionalObject]
    case 't':
      if (!word.directObjects) throw new Error('whoops')
      return word.directObjects
    default:
      return []
  }
}

const extractPreposition = (text: string): string => {
  const [, prepositionText] = text.match(/\((.*)\)/) || []
  if (!prepositionText) throw new Error('whoops')
  return prepositionText
}

export default function verbPhrase(words: WordsObject, wordId: WordId, options: Object = {}) : VerbPhrase {
  const word = words[wordId]
  const englishOptionsByPartOfSpeech = lookUpEnglish(word)
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
    ? [prepositionalPhrase(words, wordId, {
      preposition: { ...head, text: extractPreposition(head.text)},
      objectIds: getObjects(words, word),
    })]
    : []

  const complements = word.complements || []
  const {
    adverbPhrases = [],
    prepositionalPhrases: otherPrepositionalPhrases = [],
  } = verbModifiers(words, complements) || {}

  const prepositionalPhrases = firstPrepositionalPhrases.concat(otherPrepositionalPhrases)

  let result : Object = { head, adverbPhrases, prepositionalPhrases }

  if (string(head.text).features().pos === 'md') result.isModal = true

  if (word.directObjects && head.pos === 'vt') result.directObjects = word.directObjects.map(dos => nounPhrase(words, dos))
  if (word.prepositionalObject && head.pos === 'vt') result.directObjects = [nounPhrase(words, word.prepositionalObject)]
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

const getSubjectComplement = (words: WordsObject, sc: WordId, options: Object): SubjectComplementPhrase => {
  const subjectComplement = words[sc]
  if (!subjectComplement) throw new Error(JSON.stringify(sc))
  let getPhrase = nounPhrase
  if (subjectComplement.pos === 'adj') getPhrase = adjectivePhrase
  if (subjectComplement.pos === 'prep') getPhrase = prepositionalPhrase

  return getPhrase(words, sc, options)
}
// copula phrases come from predicate nouns, and from tp verb phrases whose head translates to 'vc's.
export function copulaPhrase(words: WordsObject, wordId: WordId, options: Object = {}): VerbPhrase {
  // either wordId is for copula or for subject complements.
  // should throw an error if combination doesn't make sense (leaves something missing)?
  const word = words[wordId]
  const tokiPonaInfinitive = word.infinitive
  const infinitiveTranslations = tokiPonaInfinitive ? lookUpEnglish(words[tokiPonaInfinitive]) : {}
  const predicateInfinitive = (tokiPonaInfinitive && // does this translate best to a noun?
    options.inanimateSubject && ANIMATE_SUBJECT_VERBS.includes(words[tokiPonaInfinitive].text)) // properly, primary text
    || (!['vc', 'vi', 'vt', 'vm', 'vp'].some(pos => pos in infinitiveTranslations))

  const isNegative = word.negative
  const copula = options.copula || { text: 'be', pos: 'vi' }
  const subjectComplements: Array<SubjectComplementPhrase> = (options.subjectComplements
    && options.subjectComplements.map(sc => getSubjectComplement(words, wordId, { negatedCopula: isNegative })) // should pass on english translation
  ) || (
    predicateInfinitive && tokiPonaInfinitive // if the one is there, the other will be
    ? [getSubjectComplement(words, tokiPonaInfinitive, { negatedCopula: isNegative })]
    : []
  )

  const result : VerbPhrase = {
    head: copula,
    isNegative,
    subjectComplements,
  }
  if (!predicateInfinitive) {
    if (!tokiPonaInfinitive) throw new Error('whoops')
    result.infinitive = verbPhrase(words, tokiPonaInfinitive, { isInfinitive: true })
  }
  return result
}

const flatten = (a, b) => a.concat(b)

export const realizeVerbPhrase = (phrase: VerbPhrase, subject?: SubjectPhrase) : Array<WordTranslation> => {
  const { isNegative, adverbPhrases = [], prepositionalPhrases = [], subjectComplements = [], directObjects = [], infinitive } = phrase
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
    const englishOptions = lookUpEnglish(complement)
    const english = findByPartsOfSpeech(['adv', 'prep'], englishOptions)
    switch (english.pos) {
      case 'adv':
        obj.adverbPhrases = (obj.adverbPhrases || []).concat(adverbPhrase(words, c))
        // adverb modifiers
        break
      case 'prep':
        if (typeof complement.prepositionalObject !== 'string') throw new Error('complement needs prepositional object')
        obj.prepositionalPhrases = (obj.prepositionalPhrases || [])
          .concat(prepositionalPhrase(words, c, {
            preposition: english,
            objectIds: [complement.prepositionalObject],
          }))
        break
      case 'n':
        obj.prepositionalPhrases = (obj.prepositionalPhrases || [])
          .concat(prepositionalPhrase(words, c, {
            preposition: { text: 'by', pos: 'conj' },
            objectIds: [c],
          }))
        break
      case 'prop':
        //
        break
      default:
      //   throw new Error(`No viable noun translation for ${words[c].text} (${words[c].pos})`)
    }
    return obj
  }, {})
}
