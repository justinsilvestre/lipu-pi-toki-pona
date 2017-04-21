// @flow
import type { Word } from './grammar'
import type { EnglishPartOfSpeech } from './english/partsOfSpeech'
import dictionaryEntries from './dictionaryEntries'

export type WordTranslation = {
  text: string,
  pos: EnglishPartOfSpeech,
  before?: string,
  after?: string,
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
