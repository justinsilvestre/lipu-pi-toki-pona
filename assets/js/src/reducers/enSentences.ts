import type { Action } from "../actions";

import type { EnSentencesState } from "../selectors/enSentences";

export default function enSentences(
  state: EnSentencesState = [],
  action: Action
): EnSentencesState {
  switch (action.type) {
    case "TRANSLATE_SENTENCES_SUCCESS": {
      const { enWords } = action;
      return action.enSentences.map((s, i) => {
        return { ...s, words: enWords[i].map((w) => w.id) };
      });
    }
    case "UPDATE_SENTENCE":
      const wordIds = action.words.map((w) => w.id);
      return [
        ...state.slice(0, action.index),
        { ...action.sentence, words: wordIds },
        ...state.slice(action.index + 1),
      ];
    case "CLEAR_EN_SENTENCES":
      return [];
    default:
      return state;
  }
}
