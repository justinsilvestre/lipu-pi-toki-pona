// @flow
import { combineReducers } from 'redux'
import type { Sentence, Word, WordId } from '../utils/grammar'
import type { WordsObject } from '../utils/parseTokiPona'
import type { Color } from '../utils/getHighlighting'
import type { Action } from '../actions'
import type { SentenceTranslation } from '../utils/english/grammar'
import type { MouseState } from './mouse'

import mouse, * as mouseSelectors from './mouse'
import tpSentences from './tpSentences'
import tpWords from './tpWords'
import colors from './colors'
import enSentences from './enSentences'

export type AppState = {
  tpSentences: Array<Sentence>,
  tpWords: WordsObject,
  colors: Array<Array<Color>>,

  mouse: MouseState,

  enSentences: Array<SentenceTranslation>
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
const getWordIndex = (state, wordId) => (getWord(state, wordId) || { index: -1 }).index
const getSentenceFromWord = (state: AppState, wordId: WordId) => getSentences(state)[state.tpWords[wordId].sentence]
export const getEnSentence = (state: AppState, index: number): SentenceTranslation => state.enSentences && state.enSentences[index]


export const getHighlightedWord = (state: AppState) => getWord(state, mouseSelectors.getHighlightedWord(state.mouse))
export const wasSelectionMade = (state: AppState) => mouseSelectors.wasSelectionMade(state.mouse)
const isWordBetween = (state, wordId, startId, endId) => {
  const wordIndex = getWordIndex(state, wordId)
  // console.log('is between?', getWordIndex(state, wordId), getWordIndex(state, startId), getWordIndex(state, endId))
  return (startId && endId)
    && getWordIndex(state, startId) <= wordIndex
    && wordIndex <= getWordIndex(state, endId)
}
export const isWordSelected = (state: AppState, wordId: WordId) => {
  const { start, end } = mouseSelectors.getSelection(state.mouse);
  return isWordBetween(state, wordId, start, end)
}
export const isWordInPendingSelection = (state: AppState, wordId: WordId) => {
  const { start, end } = mouseSelectors.getPendingSelection(state.mouse)
  return isWordBetween(state, wordId, start, end)
}
const getIndexInSentence = (state: AppState, wordId: WordId) : number =>
  getSentenceFromWord(state, wordId).words.indexOf(wordId)

export const getWordColor = (state: AppState, wordId: WordId) =>
  state.colors[getWord(state, wordId).sentence][getIndexInSentence(state, wordId)]
