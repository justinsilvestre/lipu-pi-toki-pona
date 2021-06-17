// @flow
import type { Action } from '../actions'
import type { EnglishPartOfSpeech } from '../utils/english/grammar'

export type EnLemmaId = number | string
export type EnLemma = {
  id: EnLemmaId,
  text: string,
  pos: EnglishPartOfSpeech,
}
export type EnLemmasState = {
  [id: EnLemmaId]: EnLemma,
}

const lemma = (text, pos): EnLemma => ({ text, id: text, pos })
export const NOT = lemma('not', 'adv')
export const OF = lemma('of', 'prep')
export const OR = lemma('or', 'conj')
export const AND = lemma('and', 'conj')
export const BY = lemma('by', 'conj')
export const BE = lemma('be', 'vc')
export const DO = lemma('do', 'vi')
export const WHEN = lemma('when', 'conj')
