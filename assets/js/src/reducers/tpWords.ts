import type { TpWordsState } from "../selectors/tpWords";
import type { Action } from "../actions";

export default function tpWords(
  state: TpWordsState = {},
  action: Action
): TpWordsState {
  switch (action.type) {
    case "PARSE_SENTENCES_SUCCESS":
      return action.tpWords;
    default:
      return state;
  }
}
