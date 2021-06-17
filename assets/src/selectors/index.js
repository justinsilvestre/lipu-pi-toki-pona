// @flow
import { combineReducers } from 'redux'
import type { SentenceTranslation } from '../utils/english/grammar'
import type { Color } from '../utils/getHighlighting'
import type { Action } from '../actions'
import type { EnglishPartOfSpeech } from '../utils/english/grammar'

import * as mouse from './mouse'
import * as tpSentences from './tpSentences'
import * as tpWords from './tpWords'
import * as colors from './colors'
import * as enSentences from './enSentences'
import * as tpLemmas from './tpLemmas'
import * as enLemmas from './enLemmas'
import * as enWords from './enWords'
import * as phraseTranslations from './phraseTranslations'
import * as documentTranslationPhrases from './documentTranslationPhrases'
import * as notifications from './notifications'

import type { MouseState } from './mouse'
import type { TpSentencesState, Sentence } from './tpSentences'
import type { TpWordsState, Word, WordId, TokiPonaPartOfSpeech } from './tpWords'
import type { ColorsState } from './colors'
import type { EnSentencesState } from './enSentences'
import type { TpLemmasState, TpLemmaId } from './tpLemmas'
import type { EnLemmasState, EnLemma, EnLemmaId } from './enLemmas'
import type { EnWordsState, EnWordId } from './enWords'
import type { State as PhraseTranslationsState, PhraseTranslationId, PhraseTranslation } from './phraseTranslations'
import type { State as DocumentTranslationPhrasesState } from './documentTranslationPhrases'
import type { State as NotificationsState } from './notifications'

export type AppState = {
  mouse: MouseState,
  tpSentences: TpSentencesState,
  tpWords: TpWordsState,
  tpLemmas: TpLemmasState,
  colors: ColorsState,
  enSentences: EnSentencesState,
  enLemmas: EnLemmasState,
  enWords: EnWordsState,
  phraseTranslations: PhraseTranslationsState,
  documentTranslationPhrases: DocumentTranslationPhrasesState,
  notifications: NotificationsState,
}

export const getTpWords = ({ tpWords }: AppState): TpWordsState => tpWords
export const getTpLemmas = ({ tpLemmas }: AppState): TpLemmasState => tpLemmas

export const getSentences = (state: AppState): Array<Sentence> => state.tpSentences

export const getWord = (state: AppState, wordId: WordId): Word => state.tpWords[wordId]
const getWordIndex = (state, wordId): number => (getWord(state, wordId) || { index: -1 }).index
export const getSentenceFromWord = (state: AppState, wordId: WordId): Sentence => getSentences(state)[state.tpWords[wordId].sentence]

export const getEnSentence = (state: AppState, index: number): SentenceTranslation => enSentences.getEnSentence(state.enSentences, index)

export const getHighlightedWord = (state: AppState): ?Word => {
  const id = mouse.getHighlightedWordId(state.mouse)
  return id ? getWord(state, id) : null
}
export const isWordHighlighted = (state: AppState, id: WordId) =>
  id === mouse.getHighlightedWordId(state.mouse)
export const wasSelectionMade = (state: AppState): boolean => mouse.wasSelectionMade(state.mouse)
const isWordBetween = (state, wordId, startId, endId): boolean => {
  const wordIndex = getWordIndex(state, wordId)
  return Boolean(
    (startId && endId)
    && getWordIndex(state, startId) <= wordIndex
    && wordIndex <= getWordIndex(state, endId)
  )
}
export const isWordSelected = (state: AppState, wordId: WordId): boolean => {
  const { start, end } = mouse.getSelection(state.mouse);
  return isWordBetween(state, wordId, start, end)
}
export const isWordInPendingSelection = (state: AppState, wordId: WordId): boolean => {
  const { start, end } = mouse.getPendingSelection(state.mouse)
  return isWordBetween(state, wordId, start, end)
}
const getIndexInSentence = (state: AppState, wordId: WordId): number =>
  getSentenceFromWord(state, wordId).words.indexOf(wordId)
export const getSelection = (state: AppState): ?Word => {
  const id = mouse.getSelection(state.mouse).start
  return id ? getWord(state, id) : null
}

export const getWordColor = (state: AppState, wordId: WordId): Color =>
  state.colors[getWord(state, wordId).sentence][getIndexInSentence(state, wordId)]

export const getEnLemma = (state: AppState, id: EnLemmaId): EnLemma =>
  state.enLemmas[id]

export const getPhraseTranslation = (state: AppState, id: PhraseTranslationId): PhraseTranslation => {
  const t = state.phraseTranslations[id]
  if (t) return t
  throw new Error('whoops')
}
export const getEnLemmaText = (state: AppState, phraseTranslationId: PhraseTranslationId): string => {
  const { enLemmaId } = getPhraseTranslation(state, phraseTranslationId)
  return getEnLemma(state, enLemmaId).text
}
export const lookUpTranslation = (state: AppState, wordId: WordId): ?PhraseTranslation => {
  const phraseTranslationId = state.documentTranslationPhrases[wordId]
  return phraseTranslationId ? getPhraseTranslation(state, phraseTranslationId) : null
}
export const lookUpTranslations = (state: AppState, tpLemmaId: TpLemmaId, enPartsOfSpeech: ?Array<EnglishPartOfSpeech>) => {
  const result = []
  for (const id in state.phraseTranslations) {
    const translation = state.phraseTranslations[Number(id)]
    const enLemma = state.enLemmas[translation.enLemmaId]
    if (enLemma && tpLemmaId === translation.tpLemmaId && (!enPartsOfSpeech || enPartsOfSpeech.some(pos => enLemma.pos === pos))) {
      result.push(translation)
    }
  }
  return result
}

export const getTpLemmaId = (state: AppState, text: string, pos: TokiPonaPartOfSpeech): ?TpLemmaId => tpLemmas.getId(state.tpLemmas, text, pos)
export const getTpLemmaText = (state: AppState, tpLemmaId: TpLemmaId): string => tpLemmas.getText(state.tpLemmas, tpLemmaId)
export const isNewProperNoun = (state: AppState, tpLemmaId: TpLemmaId): boolean => !Number.isInteger(tpLemmaId)

export const getTpText = (state: AppState, wordId: WordId): string => {
  const word = getWord(state, wordId)
  const { lemmaId, before, after } = word
  const text = lemmaId ? getTpLemmaText(state, lemmaId) : word.text
  return [before, text, after].join('')
}

export const getEnWord = (state: AppState, id: EnWordId) => enWords.getEnWord(state.enWords, id)
export const getEnWordText = (state: AppState, id: EnWordId) => enWords.getEnWordText(state.enWords, id)
export const getEnWordFromTp = (state: AppState, wordId: WordId) => enWords.getEnWordFromTp(state.enWords, wordId)
