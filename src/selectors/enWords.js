// @flow
import type { EnLemmaId, EnLemma } from '../selectors/enLemmas'
import type { WordId } from '../selectors/tpWords'
import type { PhraseTranslationId } from '../selectors/phraseTranslations'
import type { EnglishPartOfSpeech } from '../utils/english/grammar'
import { NOT, OF, OR, AND, BY, BE, DO, WHEN } from '../selectors/enLemmas'
import uuid from 'uuid'

export type EnWordId = string
export type EnWordFromTranslation = {|
  id: EnWordId,
  before?: string,
  after?: string,
  pos: EnglishPartOfSpeech,
  text: string,

  phraseTranslationId: PhraseTranslationId,
  tpWordId: WordId,
|}
export type IncidentalEnWord = {|
  id: EnWordId,
  before?: string,
  after?: string,
  pos: EnglishPartOfSpeech,
  text: string,

  lemmaId: EnLemmaId,
|}
export type EnWordPlaceholder = {|
  id: EnWordId,
  before?: string,
  after?: string,
  pos: EnglishPartOfSpeech,
  text: string,

  tpWordId: WordId,
|}
export type EnWord =
  | EnWordFromTranslation
  | IncidentalEnWord
  | EnWordPlaceholder

export type EnWordsState = {
  [id: EnWordId]: EnWord,
}

export const getEnWord = (state: EnWordsState, id: EnWordId): EnWord => state[id]
export const getEnWordText = (state: EnWordsState, id: EnWordId): string => {
  const word = getEnWord(state, id)
  const{ before = '', after = '', text } = word
  return `${before}${text}${after}`
}
export const getEnWordFromTp = (state: EnWordsState, tpWordId: WordId): ?EnWord => {
  for (const id in state) {
    const word = state[id]
    if (word.hasOwnProperty('tpWordId')) return word
  }
}

export const word = ({ text, pos, id }: EnLemma): IncidentalEnWord => ({ lemmaId: id, text, pos, id: uuid() })
export const not = () => word(NOT)
export const ofWord = () => word(OF)
export const or = () => word(OR)
export const and = () => word(AND)
export const by = () => word(BY)
export const be = () => word(BE)
export const doWord = () => word(DO)
export const when = () => word(WHEN)

export const newPlaceholder = (enWordId: EnWordId, text: string, tpWordId: WordId): EnWordPlaceholder =>
  ({ id: enWordId, text, pos: 'prop', tpWordId })
