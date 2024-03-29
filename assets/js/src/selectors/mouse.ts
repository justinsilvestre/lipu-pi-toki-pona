import type { WordId } from "./tpWords";
import type { Action } from "../actions";

export type MouseState = {
  highlightedWord?: WordId;
  pendingSelectionStart?: WordId;
  pendingSelectionEnd?: WordId;
  selectionStart?: WordId;
  selectionEnd?: WordId;
};

type SelectionRange = {
  start?: WordId;
  end?: WordId;
};

export const getSelection = (state: MouseState): SelectionRange => ({
  start: state.selectionStart,
  end: state.selectionEnd,
});
export const getPendingSelection = (state: MouseState): SelectionRange => ({
  start: state.pendingSelectionStart,
  end: state.pendingSelectionEnd,
});

export const wasSelectionMade = (state: MouseState): boolean =>
  Boolean(state.selectionStart && state.selectionEnd);

export const getHighlightedWordId = (
  state: MouseState
): WordId | null | undefined => state.highlightedWord;
