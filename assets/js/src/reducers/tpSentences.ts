import type { TpSentencesState } from "../selectors/tpSentences";
import type { Action } from "../actions";

export default function tpSentences(
  state: TpSentencesState = [],
  action: Action
): TpSentencesState {
  switch (action.type) {
    case "PARSE_SENTENCES_SUCCESS":
      return action.tpSentences;
    default:
      return state;
  }
}
