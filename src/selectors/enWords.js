// @flow
import type { EnLemmaId, EnLemma } from '../selectors/enLemmas'
import type { WordId } from '../selectors/tpWords'
import type { PhraseTranslationId } from '../selectors/phraseTranslations'
import type { EnglishPartOfSpeech } from '../utils/english/grammar'
import { NOT, OF, OR, AND, BY, BE, DO, WHEN } from '../selectors/enLemmas'
import uuid from 'uuid'

export type EnWordId = string
export type EnWord = {
  id: EnWordId,
  before?: string,
  after?: string,
  lemmaId?: EnLemmaId,
  phraseTranslationId?: PhraseTranslationId,
  tpWordId?: WordId,
  pos: EnglishPartOfSpeech,
  text: string,
}

export type EnWordsState = {
  [id: EnWordId]: EnWord,
}

export const getEnWordFromTp = (state: EnWordsState, tpWordId: WordId): ?EnWord => {
  for (const id in state) {
    const word = state[id]
    if (word.hasOwnProperty('tpWordId')) return word
  }
}

export const word = ({ text, pos }: EnLemma): EnWord => ({ text, pos, id: uuid() })
export const not = () => word(NOT)
export const ofWord = () => word(OF)
export const or = () => word(OR)
export const and = () => word(AND)
export const by = () => word(BY)
export const be = () => word(BE)
export const doWord = () => word(DO)
export const when = () => word(WHEN)
