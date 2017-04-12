// @flow
import type { WordId } from '../utils/grammar'
import type { Action } from '../actions'

export type MouseState = {
  highlightedWord: ?WordId,
  pendingSelectionStart: ?WordId,
  pendingSelectionEnd: ?WordId,
  selectionStart: ?WordId,
  selectionEnd: ?WordId,
}

const initialState = {
  highlightedWord: null,
  pendingSelectionStart: null,
  pendingSelectionEnd: null,
  selectionStart: null,
  selectionEnd: null,
}

export default function mouse(state: MouseState = initialState, action: Action) {
  switch (action.type) {
    case 'WORD_MOUSE_DOWN':
      return state
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
        // selectionStart: state.pendingSelectionStart ? state.tpWords[state.pendingSelectionStart.id] : null,
        // selectionEnd: state.pendingSelectionEnd ? state.tpWords[state.pendingSelectionEnd.id] : null,
        selectionStart: state.pendingSelectionStart ? state.highlightedWord : null,
        selectionEnd: state.pendingSelectionEnd ? state.highlightedWord : null,
      }
    default:
      return state
  }
}

type SelectionRange = {
  start: ?WordId,
  end: ?WordId,
}

export const getSelection = (state: MouseState): SelectionRange => ({
  start: state.selectionStart,
  end: state.selectionEnd,
})
export const getPendingSelection = (state: MouseState): SelectionRange => ({
  start: state.pendingSelectionStart,
  end: state.pendingSelectionEnd,
})

export const wasSelectionMade = (state: MouseState): bool => Boolean(state.selectionStart && state.selectionEnd)

export const getHighlightedWord = (state: MouseState): ?WordId => state.highlightedWord
