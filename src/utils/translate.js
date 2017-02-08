// @flow
import getEnglishPhrase from './getEnglishPhrase'
import type { Sentence, Word, WordId, TokiPonaPartOfSpeech, EnglishPartOfSpeech } from './grammar'
import type { WordsObject } from './parseTokiPona'
import { map, flatten, intersperse, last } from 'ramda'
import RiTa, { SINGULAR, PLURAL, FIRST_PERSON, THIRD_PERSON } from './rita'
import dictionary from './dictionary'

export type WordTranslation = {
  text: string,
  pos: EnglishPartOfSpeech,
}
export type SentenceTranslation = Array<WordTranslation>

const ALTERNATES = {
  kin: 'a',
  namako: 'sin',
  ali: 'ale',
  oko: 'lukin',
}
const getPrimary = (tokiPonaText: string) : string => {
  return tokiPonaText in ALTERNATES ? ALTERNATES[tokiPonaText] : tokiPonaText
}

export type EnglishDictionaryEntry = { [englishPartOfSpeech: EnglishPartOfSpeech]: Array<WordTranslation> }

const lookUpEnglish = (tokiPonaWord: Word) : EnglishDictionaryEntry => {
  const { text, pos } = tokiPonaWord
  const primaryTokiPonaText = getPrimary(text)
  const translationsByTokiPonaPartOfSpeech =  primaryTokiPonaText in dictionary ? dictionary[primaryTokiPonaText] : {}
  return translationsByTokiPonaPartOfSpeech[pos] || { prop: [{ text, pos: 'prop' }] }
}

export type FindByPartsOfSpeech = (partsOfSpeech: Array<EnglishPartOfSpeech>, translations: EnglishDictionaryEntry) => WordTranslation
const findByPartsOfSpeech : FindByPartsOfSpeech = (englishPartsOfSpeech, translations) => {
  const translationPartsOfSpeech = (Object.keys(translations) : any)
  const matchingPartOfSpeech : any = (
    englishPartsOfSpeech.find(pos => translationPartsOfSpeech.includes(pos))
    || translationPartsOfSpeech[0] : EnglishPartOfSpeech
  )
  const entry = (translations[matchingPartOfSpeech] : Array<WordTranslation>)
  return (entry[0] : WordTranslation)
}

type GrammaticalNumber = 'SINGULAR' | 'PLURAL'
type Case = 'NOMINATIVE' | 'OBLIQUE'

// const adjectivePhrase = (words: WordsObject, word: WordId) => {
//   return
//  }

// function prepositionalPhrase(words: WordsObject, ) {
//   return
// }
// , casus: Case, number: GrammaticalNumber
function nounModifiers(words: WordsObject, complements: Array<WordId>) : Object {
  return complements.reduceRight((obj, c) => {
    const complement = words[c]
    const englishOptions = lookUpEnglish(complement)
    const possiblePartsOfSpeech = (Object.keys(englishOptions) : any)
    const determinerPos = possiblePartsOfSpeech.find((pos) => pos.startsWith('d'))
    if (determinerPos) console.log('asdfasdf', determinerPos)
    if (!obj.determiner && determinerPos) obj.determiner = [englishOptions[determinerPos][0]]
    else {
      const english = findByPartsOfSpeech(['adj', 'prep'], englishOptions)
      console.log(english)
      switch (english.pos) {
        case 'adj':
          obj.adjectivePhrases = (obj.adjectivePhrases || []).concat(english)
          // adverb modifiers
          break
        case 'prep':
          if (!('prepositionalObject' in complement)) throw new Error('complement needs prepositional object')
          console.log(complement, [english, ...nounPhrase(words, complement.prepositionalObject)])
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat([english, ...nounPhrase(words, complement.prepositionalObject)])
          break
        case 'n':
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat([{ text: 'and', pos: 'conj' }, ...nounPhrase(words, complement)])
          break
        case 'prop':
          //
          break
        // case ''
        // default:
        //   throw new Error(`No viable noun translation for ${words[c].text} (${words[c].pos})`)
      }
    }
    return obj
  }, {})
}

// function toNoun(english) {
  // verb to gerund
  // adjective to "x one"
// }

function nounPhrase(words: WordsObject, wordId: WordId) : Array<WordTranslation> {
  const word = words[wordId]
  const englishOptionsByPartOfSpeech = lookUpEnglish(word)
  // qualifier - determiner - adjective phrases - noun - prepositional phrases - appositives
  // qualifier - pronoun - conjoined adjective phrases - prepositional phrases
  const noun = findByPartsOfSpeech(['n', 'pn'], englishOptionsByPartOfSpeech)
  // const noun = toNoun(findByPartsOfSpeech(['n', 'pn'], englishOptionsByPartOfSpeech))
  const complements = word.complements || []
  const { determiner, adjectivePhrases, prepositionalPhrases, appositives } = nounModifiers(words, complements) || {}
  // should return object
  return [
    ...(determiner || []),
    ...(adjectivePhrases || []),
    noun,
    ...(prepositionalPhrases || [])
  ]
  // const pronouns = englishOptionsByPartOfSpeech.pn
  // const nouns = englishOptionsByPartOfSpeech.n
  // return (nouns && nouns[0])
  //   || (pronouns && pronouns[0])
  //   || Object.values(englishOptionsByPartOfSpeech)[0][0]
}

function predicatePhrase(words, headId, tokiPonaSubjectHead, englishSubjectNumber) {
  //
}

export default function translate(sentences: Array<Sentence>, words: WordsObject) : Array<SentenceTranslation> {
  return sentences.map(({ words: sentenceWords, predicates, mood, subjects = [], vocative, contexts = {}, seme = [] }) => {

    const subjectTranslations = subjects.map(s => {
        console.log(words[s].text, lookUpEnglish(words[s]))
        return nounPhrase(words, s)
      }).reduce((a, b) => a.concat(b), [])
    const predicateTranslations = predicates.map(p => {
      return nounPhrase(words, p)
    }).reduce((a, b) => a.concat(b), [])
    const mainClauseTranslation = [...subjectTranslations, ...predicateTranslations]

    return [
      ...mainClauseTranslation,
    ]
  })
}
