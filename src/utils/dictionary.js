// @flow
import type { Word } from './grammar'
import type { EnglishPartOfSpeech } from './english/grammar'
import dictionaryEntries from './dictionaryEntries'

export type WordTranslation = {
  text: string,
  pos: EnglishPartOfSpeech,
  before?: string,
  after?: string,
  interrogative?: boolean,
  root?: string,
}

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
  // throw error if not proper noun and no entries?
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
