// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import type { WordTranslation } from '../dictionary'
import type { WordId } from '../grammar'
import type { WordsObject } from '../parseTokiPona'
import type { VerbPhrase, SubjectPhrase, NounPhrase, AdjectivePhrase } from './grammar'
import nounPhrase, { realizeNounPhrase } from './nounPhrase'
import adjectivePhrase, { realizeAdjectivePhrase } from './adjectivePhrase'
import prepositionalPhrase, { realizePrepositionalPhrase } from './prepositionalPhrase'
import RiTa, { SINGULAR, PLURAL, FIRST_PERSON, THIRD_PERSON } from '../rita'

const realizeSubjectComplement = (englishTranslation: NounPhrase | AdjectivePhrase) : Array<WordTranslation> => {
  if (englishTranslation.head.pos === 'adj') {
    const adjectiveTranslation : AdjectivePhrase = (englishTranslation : any)
    return realizeAdjectivePhrase(adjectiveTranslation)
  } else if (englishTranslation.head.pos === 'n') {
    const nounTranslation : NounPhrase = (englishTranslation : any)
    return realizeNounPhrase(nounTranslation)
  } else {
    throw new Error('Subject complement must be noun or adjective')
  }
  //
  //
  // return englishTranslation.head.pos === 'adj' ? realizeAdjectivePhrase(englishTranslation) : realizeNounPhrase(englishTranslation)
}

// use options to coerce to copula phrase,
// or give different POS priorities
export default function verbPhrase(words: WordsObject, wordId: WordId, options?: Object) : VerbPhrase {
  const word = words[wordId]
  const englishOptionsByPartOfSpeech = lookUpEnglish(word)
  const head = findByPartsOfSpeech(['vi', 'vt', 'vm'], englishOptionsByPartOfSpeech)

  if (head && !['vi', 'vt', 'vm'].includes(head.pos)) {
    return copulaPhrase(words, wordId, head)
  }

  const complements = word.complements || []
  const {
    directObjects = [],
    adverbPhrases = [],
    prepositionalPhrases = [],
  } = verbModifiers(words, complements) || {}

// return { head }
  return { head, adverbPhrases, prepositionalPhrases, directObjects }
}

export function copulaPhrase(words: WordsObject, subjectComplementTokiPonaId: WordId, subjectComplementTranslation: WordTranslation) {
  const getPhrase = subjectComplementTranslation.pos === 'adj' ? adjectivePhrase : nounPhrase

  return {
    head: { text: 'be', pos: 'vi' },
    subjectComplements: [nounPhrase(words, subjectComplementTokiPonaId)],
  }
}

const conjugate = (verb: WordTranslation, isPlural: boolean, isFirstPerson: boolean) => {
  const newText = RiTa.conjugate(verb.text, {
    number: isPlural ? PLURAL : SINGULAR,
    person: isFirstPerson ? FIRST_PERSON : THIRD_PERSON,
  })

  return {
    ...verb,
    text: newText,
    root: verb.text,
  }
}

export const realizeVerbPhrase = ({ head, adverbPhrases, prepositionalPhrases, subjectComplements = [] }: VerbPhrase, subject: SubjectPhrase) => {
  return [
    conjugate(head, subject.isPlural, subject.isFirstPerson),
    // conjugate(head, subject.isPlural, subject.isFirstPerson),
    ...subjectComplements.map(realizeSubjectComplement).reduce((a, b) =>   a.concat(b), []),
    // ...adverbPhrases,
    // ...prepositionalPhrases,
  ]
}

function verbModifiers(words: WordsObject, complements: Array<WordId>) : Object {
  return complements.reduceRight((obj, c) => {
    const complement = words[c]
    const englishOptions = lookUpEnglish(complement)
    const possiblePartsOfSpeech = (Object.keys(englishOptions) : any)
    const english = findByPartsOfSpeech(['adv', 'prep'], englishOptions)
    // directObjects
    // prepositionalObject
    // infinitive
    // complements
    // predicate noun/adjective
    console.log(english)
    switch (english.pos) {
      case 'adj':
        obj.adverbPhrases = (obj.adverbPhrases || []).concat(english)
        // adverb modifiers
        break
      case 'prep':
        if (typeof complement.prepositionalObject !== 'string') throw new Error('complement needs prepositional object')
        obj.prepositionalPhrases = (obj.prepositionalPhrases || [])
          .concat(prepositionalPhrase(words, english, complement.prepositionalObject))
        break
      case 'n':
        obj.prepositionalPhrases = (obj.prepositionalPhrases || [])
          .concat(prepositionalPhrase(words, { text: 'by', pos: 'conj' }, c))
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
