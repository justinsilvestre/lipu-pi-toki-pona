import type { Action } from "../actions";
import type { State } from "../selectors/documentTranslationPhrases";

export default function documentTranslationPhrases(
  state: State = {},
  action: Action
): State {
  switch (action.type) {
    case "SET_WORD_TRANSLATION":
    case "CHANGE_WORD_TRANSLATION":
      return {
        ...state,
        [action.wordId]: action.phraseTranslationId,
      };
    case "CLEAR_EN_SENTENCES":
      return {};
    default:
      return state;
  }
}
