// @flow
import getEnglishPhrase from './getEnglishPhrase'
import type { Sentence, Word, WordId, TokiPonaPartOfSpeech, EnglishPartOfSpeech } from './grammar'
import type { WordsObject } from './parseTokiPona'
import { map, flatten, intersperse, last } from 'ramda'
import RiTa, { SINGULAR, PLURAL, FIRST_PERSON, THIRD_PERSON } from './rita'
import dictionaryEntries from './dictionaryEntries'
import { ANIMATE_NOUNS } from './tokiPonaSemanticGroups.js'
import nounPhrase from './english/nounPhrase'

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
export const getPrimary = (tokiPonaText: string) : string => {
  return tokiPonaText in ALTERNATES ? ALTERNATES[tokiPonaText] : tokiPonaText
}

export type EnglishDictionaryEntry = { [englishPartOfSpeech: EnglishPartOfSpeech]: Array<WordTranslation> }

export const lookUpEnglish = (tokiPonaWord: Word) : EnglishDictionaryEntry => {
  const { text, pos } = tokiPonaWord
  const primaryTokiPonaText = getPrimary(text)
  const translationsByTokiPonaPartOfSpeech =  primaryTokiPonaText in dictionaryEntries ? dictionaryEntries[primaryTokiPonaText] : {}
  return translationsByTokiPonaPartOfSpeech[pos] || { prop: [{ text, pos: 'prop' }] }
}

export type FindByPartsOfSpeech = (partsOfSpeech: Array<EnglishPartOfSpeech>, translations: EnglishDictionaryEntry)
  => WordTranslation
export const findByPartsOfSpeech : FindByPartsOfSpeech = (englishPartsOfSpeech, translations) => {
  const translationPartsOfSpeech = (Object.keys(translations) : any)
  const matchingPartOfSpeech : any = (
    englishPartsOfSpeech.find(pos => translationPartsOfSpeech.includes(pos))
    || translationPartsOfSpeech[0] : EnglishPartOfSpeech
  )
  const entry = (translations[matchingPartOfSpeech] : Array<WordTranslation>)
  return (entry[0] : WordTranslation)
}
