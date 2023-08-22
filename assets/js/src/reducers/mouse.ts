import type { WordId } from "../selectors/tpWords";
import type { Action } from "../actions";
import type { MouseState } from "../selectors/mouse";

const initialState: MouseState = {
  highlightedWord: null,
  pendingSelectionStart: null,
  pendingSelectionEnd: null,
  selectionStart: null,
  selectionEnd: null,
};

export default function mouse(
  state: MouseState = initialState,
  action: Action
) {
  switch (action.type) {
    case "WORD_MOUSE_DOWN":
      return state;
    case "WORD_MOUSE_ENTER":
      return {
        ...state,
        highlightedWord: action.word,
      };
    case "WORD_MOUSE_LEAVE":
      return {
        ...state,
        highlightedWord: null,
      };
    case "DELIMIT_PENDING_SELECTION":
      return {
        ...state,
        pendingSelectionStart: action.start,
        pendingSelectionEnd: action.end,
      };
    case "SELECT_WORDS":
      return {
        ...state,
        pendingSelectionStart: null,
        pendingSelectionEnd: null,
        selectionStart: state.pendingSelectionStart
          ? state.highlightedWord
          : null,
        selectionEnd: state.pendingSelectionEnd ? state.highlightedWord : null,
      };
    case "DESELECT":
      return initialState;
    default:
      return state;
  }
}
