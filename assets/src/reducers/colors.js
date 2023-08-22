// @flow
import getHighlighting from '../utils/getHighlighting'
import type { Action } from '../actions'
import type { ColorsState } from '../selectors/colors'

export default function colors(state: ColorsState = [], action: Action): ColorsState {
  switch (action.type) {
    case 'PARSE_SENTENCES_SUCCESS': {
      const { tpWords } = action
      return action.tpSentences.map(s => getHighlighting(tpWords, s.words))
    }
    default:
      return state
  }
}
