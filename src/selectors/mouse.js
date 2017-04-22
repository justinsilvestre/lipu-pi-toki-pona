// @flow
import type { WordId } from '../selectors/tpWords'
import type { Action } from '../actions'

export type MouseState = {
  highlightedWord: ?WordId,
  pendingSelectionStart: ?WordId,
  pendingSelectionEnd: ?WordId,
  selectionStart: ?WordId,
  selectionEnd: ?WordId,
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
