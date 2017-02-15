@flow
import getEnglishPhrase from './getEnglishPhrase'
import type { WordTranslation, EnglishPartOfSpeech } from './getEnglishPhrase'
import type { Sentence, Word, WordId, TokiPonaPartOfSpeech } from './grammar'
import type { WordsObject } from './parseTokiPona'
import { map, flatten, intersperse, last } from 'ramda'
import RiTa, { SINGULAR, PLURAL, FIRST_PERSON, THIRD_PERSON } from './rita'
import dictionary from './dictionary'

export type SentenceTranslation = Array<WordTranslation>

// first use tp sentence-role to get en sentence role + possible en parts of speech
// then use tp context to choose probable english phrase based on animacy+gender
// then use en sentence role + tp context/linked en words to get en inflection

// const PART_OF_SPEECH_CORRESPONDENCES : { [tpPos: TokiPonaPartOfSpeech]: Array<EnglishPartOfSpeech> } = {
//   i: ['adj', 'adv', 'n', 'vi', 'pn', 'pnp', 'pnin', 'pnio', 'pnpn', 'pnpo', 'pns', 'pnsn', 'pnso', 'pno'],
//   t: ['vt'],
//   prev: ['vm', 'vt'],
//   prep: ['prep'],
// }
// const getEnglishPartsOfSpeech = (tokiPonaPartOfSpeech: TokiPonaPartOfSpeech) : Array<EnglishPartOfSpeech> => {
//   return tokiPonaPartOfSpeech in PART_OF_SPEECH_CORRESPONDENCES
//     ? PART_OF_SPEECH_CORRESPONDENCES[tokiPonaPartOfSpeech]
//     : []
// }

const ANIMATE_NOUNS = [
  'meli', 'mije',
  'akesi', 'soweli', 'jan', 'kala', 'waso', 'kasi', 'pipi',
]
const ANIMATE_SUBJECT_VERBS = [
  'alasa', 'lukin', 'kute', 'moku', 'moli', 'lape', 'unpa', 'pilin', 'sitelen', 'toki', 'pakala', 'utala', 'nasa', 'olin', 'pilin', 'pu', 'sona', 'wile', 'mu',
]
const INANIMATE_NOUNS = [
  'ijo', 'esun', 'ilo', 'tomo', 'kili', 'lawa', 'luka', 'uta', 'suno', 'mun', 'mani', 'tomo', 'nimi', 'len', 'oko', 'noka', 'pan', 'sijelo',
]
const PRONOUNS = ['mi', 'sina', 'ona', 'ni']


const ALTERNATES = {
  kin: 'a',
  namako: 'sin',
  ali: 'ale',
  oko: 'lukin',
}
const getPrimary = (tokiPonaText: string) : string => {
  return tokiPonaText in ALTERNATES ? ALTERNATES[tokiPonaText] : tokiPonaText
}

const lookUpEnglish = (tokiPonaWord: Word) : Array<{ [enPos: EnglishPartOfSpeech]: string }> => {
  if (!tokiPonaWord) console.log('&&&&', tokiPonaWord)
  const { text, pos } = tokiPonaWord
  const primaryTokiPonaText = getPrimary(text)
  const translationsByTokiPonaPartOfSpeech =  primaryTokiPonaText in dictionary ? dictionary[primaryTokiPonaText] : {}
  return translationsByTokiPonaPartOfSpeech[pos] || []
}

type GrammaticalNumber = 'SINGULAR' | 'PLURAL' | 'INDEFINITE'
type Animacy = 'ANIMATE' | 'INANIMATE' | 'INDEFINITE'
type Case = 'NOMINATIVE' | 'OBLIQUE'
const isEligibleDeterminer = (englishPartOfSpeech: EnglishPartOfSpeech, isPlural: boolean) : boolean => {
  if (englishPartOfSpeech === 'd') return true
  if (isPlural) return englishPartOfSpeech === 'dp'
  else return englishPartOfSpeech === 'ds'
}
const getPronounPhrase = (wordId: WordId, words: WordsObject, casus: Case, number?: GrammaticalNumber) => {

}
const getNoun = (englishWords) => {
  // const noun = englishWords.find(({ pos }) => pos === 'n')
  const noun = englishWords.find(({ pos }) => pos === 'n' || pos.startsWith('pn'))
  if (noun) return noun
  else throw new Error('whoops')
  // else {
  //   const verb = englishWords.find(({ pos }) => ['vi', 'vt'].includes(pos))
  //   return
  // }
}
const isCapitalized = (str) => {
  const firstLetter = str[0]
  return firstLetter === firstLetter.toUpperCase()
}
function getNounPhrase (wordId: WordId, words: WordsObject, casus: Case = 'OBLIQUE', number?: GrammaticalNumber) {
  // determiner - adjective - head - appositive - prepositional - relative
  // personal pn - appositive
  // indefinite pn - adjective - prepositional - relative
  // possessive ('s) - adjective
  // determiner - adjective - head - possessive (of 's) - prepositional - relative
  const word = words[wordId]
  const complements  = word.complements || []
  const isPlural = number === 'PLURAL' || complements.some(c => words[c].text === 'mute')
  if (PRONOUNS.includes(word.text)) return getPronounPhrase(wordId, words, casus, number)
  // if (complements.some(c => isCapitalized(words[c].text))) return getProperNounPhrase(wordId, words, casus, number)
  // find the words who can only be determiner
  // or determiners that arent discounted by the number
  const lastComplement = last(complements) || ''
  if (!(lastComplement in words)) throw new Error('whoops')
  const determiner = lookUpEnglish(words[lastComplement]).filter(({ pos }) => isEligibleDeterminer(pos, isPlural)).slice(0, 1)
  console.log('determiner', determiner)
  const head = getNoun(lookUpEnglish(words[wordId]))
  // throw error if head is proper noun
  const adjectivePhrases = complements.map(c => {
    const adjective = lookUpEnglish(words[c]).filter(({ pos }) => pos === 'adj')
    if (adjective) {
      return
    }
  }).filter(c => c)
  const prepositionalPhrases = complements.map(c => {
    const complement = words[c]
    if (complement.pos === 'prep') {
      const preposition = lookUpEnglish(complement).find(({ pos }) => pos === 'prep')
      if (!preposition) throw new Error('whoops')
      if (!complement.prepositionalObject) throw new Error('whoops')
      return [{ text: preposition.text, pos: 'prep' }, ...getNounPhrase(complement.prepositionalObject, words, 'OBLIQUE')]
    } else {
      const complementTranslations = lookUpEnglish(complement)
      const nouns = complementTranslations.filter(({ pos }) => pos === 'n')
      if (nouns.length && (nouns.length === complementTranslations.length))
        return [{ text: 'of', pos: 'prep' }, ...getNounPhrase(c, words, 'OBLIQUE')]
    }
  }).filter(c => c) // if only noun translations, or if tp prep
  return [
    ...determiner,
    // ...adjectives,
    head,
    ...flatten(prepositionalPhrases),
  ]
}

const getAdjectivePhrase = (adjective, complements) => {}
function getPrepositionalPhrase (nounPhrase, prepositionText) {

}
const getClause = (subjects, predicates, mood, tense) => {
  // animacy of predicate determined by subject head
}
const getSubordinateClause = (clause, conjunction) => {}
const getVocativePhrase = (wordId: wordId, words: WordsObject) => {}
const getPredicatePhrase = (head, words, subjectTranslations) => {
  // when head is i
    // if subject is animate, favor verb translation.
    // if subject is inanimate, favor noun/adjective translation.
    // otherwise, favor verb
}
const getAdverbPhrase = () => {}

export default function translate(sentences: Array<Sentence>, words: WordsObject) : Array<SentenceTranslation> {
  // const englishPhrases : EnglishPhrases = map((word) => getEnglishPhrase(word, words), words)
  return sentences.map(({ words: sentenceWords, predicates, mood, subjects = [], vocative, contexts = {}, seme = [] }) => {
    const subjectTranslations = subjects.map(s => getNounPhrase(s, words, 'NOMINATIVE'))
    console.log(subjectTranslations)
    // const predicateTranslations = predicates.map(p => getPredicatePhrase(p, words, subjectTranslations))
    // const mainClauseTranslation = getClause(subjectTranslations, predicateTranslations, mood)
    // const subordinateClauseTranslations = contexts.filter(c => c.subjects).map(({ subjects, predicates }) =>
    //   getClause(subjects, predicates, mood, tense)
    // )
    // const adverbTranslations = contexts.filter(c => !c.subjects).map(({ predicates: [predicate] }) =>
    //   getAdverbPhrase(predicate)
    // )

    return subjectTranslations
    // const phrases = sentenceWords.map(w => getEnglishPhrase(words[w], words))
    // return phrases
  })
}

// //
// // type MapFn<T,R> = (fn: (x:T) => R, xs: {[key: string]: T}) => {[key: string]: R}
// // const map : MapFn<*,*> = (fn, obj) => {
// //   const result = {}
// //   for (const key of Object.keys(obj)) {
// //     result[key] = fn(obj[key])
// //   }
// //   return result
// // }
//
// const nounPhrase = (headId: WordId, words: WordsObject) => {
//   const tokiPonaHead = words[headId]
//   const englishHead = getEnglishPhrase(tokiPonaHead, words)
//   if (!englishHead) throw new Error('whoops')
//   const englishComplements = (tokiPonaHead.complements || []).reverse().map(c => getEnglishPhrase(words[c], words))
//   return [...englishComplements, englishHead]
// }
//
// const and = { text: 'and', pos: 'conj' }
// const getSubject = () => {
//
// }
//
// type EnglishPhrases = { [tokiPonaWord: WordId] : WordTranslation }
//
// const predicatePhrase = (headId: WordId, words: WordsObject, englishPhrases: EnglishPhrases, [firstSubject, ...latterSubjects]: Array<WordId> = []) => {
//   const englishPhrase = englishPhrases[headId]
//   const englishPos = englishPhrase.pos
//   const isNounPredicate = englishPos === 'n' || englishPos.includes('pn')
//   const verb = isNounPredicate ? { text: 'be' } : englishPhrase
//   const subjectComplement = isNounPredicate ? englishPhrase : null
//   if (firstSubject) {
//     if (englishPos === 'vm') return { text: verb.text }
//     const isPlural = latterSubjects.length > 0
//       // or subject complements includes dp (referent is plural)
//       || (words[firstSubject].complements || []).some(c => englishPhrases[c].pos === 'dp')
//       // or subject is plural pronoun
//       || englishPhrases[firstSubject].pos.includes('pnp')
//     console.log(verb, words[firstSubject])
//     const isFirstPerson = !isPlural && englishPhrases[firstSubject].pos.includes('pni')
//     console.log(words[headId].text, 'plural?', isPlural, 'first person?', isFirstPerson)
//     const text = RiTa.conjugate(verb.text, {
//       number: isPlural ? PLURAL : SINGULAR,
//       person: isFirstPerson ? FIRST_PERSON : THIRD_PERSON,
//     })
//
//     return [{ text }].concat(subjectComplement || [])
//   } else {
//     return [englishPhrase]
//   }
// }
//
// export default function translate(sentences: Array<Sentence>, words: WordsObject) : Array<SentenceTranslation> {
//   const englishPhrases : EnglishPhrases = map((word) => getEnglishPhrase(word, words), words)
//   return sentences.map(({ words: sentenceWords, subjects = [], predicates }) => {
//     // const phrases = sentenceWords.map(w => getEnglishPhrase(words[w], words))
//
//     const subjectPhrases = subjects.map(subject => nounPhrase(subject, words))
//
//     return [
//       ...flatten(intersperse(and, subjectPhrases)),
//       ...flatten(predicates.map(predicate => predicatePhrase(predicate, words, englishPhrases, subjects)).filter(v=>v)),
//     ]
//   })
// }
