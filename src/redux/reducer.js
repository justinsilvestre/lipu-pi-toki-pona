// @flow
import type { Sentence, Word } from '../utils/grammar'
import type { Action } from './actions'

export type AppState = {
  tpSentences: Array<Sentence>,

  highlightedWord: ?Word,
  pendingSelectionStart: ?Word,
  pendingSelectionEnd: ?Word,
  selectionStart: ?Word,
  selectionEnd: ?Word,

}
const initialState : AppState = {
  tpSentences: [],

  highlightedWord: null,
  pendingSelectionStart: null,
  pendingSelectionEnd: null,
  selectionStart: null,
  selectionEnd: null,
}

export default function app(state: AppState = initialState, action: Action) : AppState {
  switch(action.type) {
    case 'WORD_MOUSE_DOWN':
    console.log(action)
      return state
    case 'PARSE_SENTENCES':
      return {
        ...state,
        tpSentences: action.tpSentences,
      }
    case 'WORD_MOUSE_ENTER':
      return {
        ...state,
        highlightedWord: action.word,
      }
    case 'WORD_MOUSE_LEAVE':
      return {
        ...state,
        highlightedWord: null,
      }
    case 'DELIMIT_PENDING_SELECTION':
      return {
        ...state,
        pendingSelectionStart: action.start,
        pendingSelectionEnd: action.end,
      }
    case 'SELECT_WORDS':
      return {
        ...state,
        pendingSelectionStart: null,
        pendingSelectionEnd: null,
        selectionStart: state.pendingSelectionStart,
        selectionEnd: state.pendingSelectionEnd,
      }
    default:
      return state
  }
}

export const isSelectionPending = (state : AppState) : bool =>
  state.pendingSelectionStart !== null
export const wasSelectionMade = (state : AppState) : bool => state.selectionStart !== null
