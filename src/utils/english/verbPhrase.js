// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import type { WordTranslation } from '../dictionary'
import type { WordId } from '../grammar'
import type { WordsObject } from '../parseTokiPona'
import type { VerbPhrase } from './grammar'
import nounPhrase, { realizeNounPhrase } from './nounPhrase'
import adjectivePhrase, { realizeAdjectivePhrase } from './adjectivePhrase'
import RiTa, { SINGULAR, PLURAL, FIRST_PERSON, THIRD_PERSON } from '../rita'

const realizeNounOrAdjectivePhrase = (englishTranslation: WordTranslation) => {
  return englishTranslation.pos === 'adj' ? realizeAdjectivePhrase(englishTranslation) : realizeNounPhrase(englishTranslation)
}

export default function verbPhrase(words: WordsObject, wordId: WordId) : VerbPhrase {
  const word = words[wordId]
  const englishOptionsByPartOfSpeech = lookUpEnglish(word)
  const head = findByPartsOfSpeech(['vi', 'vt', 'vm'], englishOptionsByPartOfSpeech)

  if (head && !['vi', 'vt', 'vm'].includes(head.pos)) {
    debugger
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
debugger
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

export const realizeVerbPhrase = ({ head, adverbPhrases, prepositionalPhrases, subjectComplements = [] }: VerbPhrase, subject) => {
  return [
    conjugate(head, subject.isPlural, subject.isFirstPerson),
    // conjugate(head, subject.isPlural, subject.isFirstPerson),
    ...subjectComplements.map(realizeNounOrAdjectivePhrase).reduce((a, b) =>   a.concat(b), []),
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
        if (!('prepositionalObject' in complement)) throw new Error('complement needs prepositional object')
        console.log(complement, [english, ...nounPhrase(words, complement.prepositionalObject).words])
        obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat([english, ...nounPhrase(words, complement.prepositionalObject)])
        break
      case 'n':
        obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat([{ text: 'and', pos: 'conj' }, ...nounPhrase(words, complement).words])
        break
      case 'prop':
        //
        break
      // case ''
      // default:
      //   throw new Error(`No viable noun translation for ${words[c].text} (${words[c].pos})`)
    }
    return obj
  }, {})
}
