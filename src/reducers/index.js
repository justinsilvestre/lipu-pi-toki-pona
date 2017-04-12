// @flow
import { combineReducers } from 'redux'
import type { Sentence, Word, WordId } from '../utils/grammar'
import type { SentenceTranslation } from '../utils/english/grammar'
import type { WordsObject } from '../utils/parseTokiPona'
import type { Color } from '../utils/getHighlighting'
import type { Action } from '../actions'

import mouse, * as mouseSelectors from './mouse'
import tpSentences, * as tpSentencesSelectors from './tpSentences'
import tpWords, * as tpWordsSelectors from './tpWords'
import colors, * as colorsSelectors from './colors'
import enSentences, { getEnSentence as e}from './enSentences'

import type { MouseState } from './mouse'
import type { TpSentencesState } from './tpSentences'
import type { TpWordsState } from './tpWords'
import type { ColorsState } from './colors'
import type { EnSentencesState } from './enSentences'

export type AppState = {
  tpSentences: TpSentencesState,
  tpWords: TpWordsState,
  colors: ColorsState,

  mouse: MouseState,

  enSentences: EnSentencesState,
}

type Reducer = (state: AppState, action: Action) => AppState

const reducer = combineReducers({
  tpSentences,
  tpWords,
  colors,
  enSentences,
  mouse,
})

export default reducer

export const getSentences = (state: AppState): Array<Sentence> => state.tpSentences
export const getWord = (state: AppState, wordId: WordId): Word => state.tpWords[wordId]
const getWordIndex = (state, wordId): number => (getWord(state, wordId) || { index: -1 }).index
const getSentenceFromWord = (state: AppState, wordId: WordId): Sentence => getSentences(state)[state.tpWords[wordId].sentence]

export const getEnSentence = (state: AppState, index: number): SentenceTranslation => e(state.enSentences, index)

export const getHighlightedWord = (state: AppState): ?Word => {
  const id = mouseSelectors.getHighlightedWord(state.mouse)
  return id ? getWord(state, id) : null
}
export const wasSelectionMade = (state: AppState): boolean => mouseSelectors.wasSelectionMade(state.mouse)
const isWordBetween = (state, wordId, startId, endId): boolean => {
  const wordIndex = getWordIndex(state, wordId)
  return Boolean(
    (startId && endId)
    && getWordIndex(state, startId) <= wordIndex
    && wordIndex <= getWordIndex(state, endId)
  )
}
export const isWordSelected = (state: AppState, wordId: WordId): boolean => {
  const { start, end } = mouseSelectors.getSelection(state.mouse);
  return isWordBetween(state, wordId, start, end)
}
export const isWordInPendingSelection = (state: AppState, wordId: WordId): boolean => {
  const { start, end } = mouseSelectors.getPendingSelection(state.mouse)
  return isWordBetween(state, wordId, start, end)
}
const getIndexInSentence = (state: AppState, wordId: WordId): number =>
  getSentenceFromWord(state, wordId).words.indexOf(wordId)

export const getWordColor = (state: AppState, wordId: WordId): Color =>
  state.colors[getWord(state, wordId).sentence][getIndexInSentence(state, wordId)]
