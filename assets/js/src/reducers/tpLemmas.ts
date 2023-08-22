import type { TpLemmasState } from "../selectors/tpLemmas";
import type { Action } from "../actions";

export default function tpLemmas(
  state: TpLemmasState = {},
  action: Action
): TpLemmasState {
  switch (action.type) {
    case "PARSE_SENTENCES_SUCCESS":
      if (action.properNouns.length) {
        const newState = { ...state };
        action.properNouns.forEach((pn) => (newState[pn.id] = pn));
        return newState;
      } else {
        return state;
      }
    default:
      return state;
  }
}
