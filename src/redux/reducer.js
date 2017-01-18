// @flow
import type { Sentence, Word, WordId } from '../utils/grammar'
import type { WordsObject } from '../utils/parseTokiPona'
import getHighlighting from '../utils/getHighlighting'
import type { Color } from '../utils/getHighlighting'
import type { Action } from './actions'

export type AppState = {
  tpSentences: Array<Sentence>,
  tpWords: WordsObject,
  colors: Array<Array<Color>>,

  highlightedWord: ?Word,
  pendingSelectionStart: ?Word,
  pendingSelectionEnd: ?Word,
  selectionStart: ?Word,
  selectionEnd: ?Word,

}
const initialState : AppState = {
  tpSentences: [],
  tpWords: {},
  colors: [],

  highlightedWord: null,
  pendingSelectionStart: null,
  pendingSelectionEnd: null,
  selectionStart: null,
  selectionEnd: null,

  enSentences: [],
}

export default function app(state: AppState = initialState, action: Action) : AppState {
  switch(action.type) {
    case 'WORD_MOUSE_DOWN':
      return state
    case 'PARSE_SENTENCES': {
      const { tpWords } = action
      return {
        ...state,
        tpSentences: action.tpSentences,
        tpWords,
        colors: action.tpSentences.map(s => getHighlighting(tpWords, s.words))
      }
    }
    case 'WORD_MOUSE_ENTER':
      return {
        ...state,
        highlightedWord: state.tpWords[action.word],
      }
    case 'WORD_MOUSE_LEAVE':
      return {
        ...state,
        highlightedWord: null,
      }
    case 'DELIMIT_PENDING_SELECTION':
      return {
        ...state,
        pendingSelectionStart: state.tpWords[action.start],
        pendingSelectionEnd: state.tpWords[action.end],
      }
    case 'SELECT_WORDS':
      return {
        ...state,
        pendingSelectionStart: null,
        pendingSelectionEnd: null,
        selectionStart: state.pendingSelectionStart ? state.tpWords[state.pendingSelectionStart.id] : null,
        selectionEnd: state.pendingSelectionEnd ? state.tpWords[state.pendingSelectionEnd.id] : null,
      }
    case 'TRANSLATE_SENTENCES':
      return {
        ...state,
        enSentences: action.enSentences,
      }
    default:
      return state
  }
}

const getWord = (state : AppState, wordId : WordId) => state.tpWords[wordId]
const getSentenceFromWord = (state : AppState, wordId : WordId) => state.tpSentences[state.tpWords[wordId].sentence]

export const wasSelectionMade = (state : AppState) : bool => (!state.selectionStart || !state.selectionEnd)

export const isWordSelected = (state : AppState, wordId: WordId) => {
  if (!state.selectionStart || !state.selectionEnd) return false

  const word = state.tpWords[wordId]
  const { selectionStart, selectionEnd } = state
  const startIndex = selectionStart.index
  const wordIndex = word.index
  const endIndex = selectionEnd.index

  return startIndex <= wordIndex && wordIndex <= endIndex
}
export const isWordInPendingSelection = (state : AppState, wordId: WordId) => {
  if (!state.pendingSelectionStart || !state.pendingSelectionEnd) return false

  const word = state.tpWords[wordId]
  const { pendingSelectionStart, pendingSelectionEnd } = state
  const startIndex = pendingSelectionStart.index
  const wordIndex = word.index
  const endIndex = pendingSelectionEnd.index

  return startIndex <= wordIndex && wordIndex <= endIndex
}

const getIndexInSentence = (state : AppState, wordId: WordId) : number =>
  getSentenceFromWord(state, wordId).words.indexOf(wordId)

export const getWordColor = (state : AppState, wordId: WordId) =>
  state.colors[getWord(state, wordId).sentence][getIndexInSentence(state, wordId)]
