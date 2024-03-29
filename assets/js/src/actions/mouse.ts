import type { TpWordsState } from "../selectors/tpWords";
import type { Sentence } from "../selectors/tpSentences";
import type { WordId } from "../selectors/tpWords";
import type { SentenceTranslation } from "../utils/english/grammar";

export type Action =
  | { type: "WORD_MOUSE_ENTER"; word: WordId }
  | { type: "WORD_MOUSE_LEAVE"; word: WordId }
  | { type: "WORD_MOUSE_DOWN"; word: WordId }
  | { type: "WORD_MOUSE_UP"; word: WordId }
  | { type: "WORD_CLICK"; word: WordId }
  | { type: "SELECT_WORDS" }
  | { type: "DELIMIT_PENDING_SELECTION"; start: WordId; end: WordId }
  | { type: "TRANSLATE_SENTENCES"; enSentences: Array<SentenceTranslation> }
  | { type: "DESELECT" };

export const wordMouseEnter = (word: WordId): Action => ({
  type: "WORD_MOUSE_ENTER",
  word,
});
export const wordMouseLeave = (word: WordId): Action => ({
  type: "WORD_MOUSE_LEAVE",
  word,
});
export const wordMouseDown = (word: WordId): Action => ({
  type: "WORD_MOUSE_DOWN",
  word,
});
export const wordMouseUp = (word: WordId): Action => ({
  type: "WORD_MOUSE_UP",
  word,
});
export const wordClick = (word: WordId): Action => ({
  type: "WORD_CLICK",
  word,
});

export const delimitPendingSelection = (
  start: WordId,
  end: WordId
): Action => ({
  type: "DELIMIT_PENDING_SELECTION",
  start,
  end,
});

export const selectWords = (): Action => ({
  type: "SELECT_WORDS",
});

export const deselect = (): Action => ({
  type: "DESELECT",
});
