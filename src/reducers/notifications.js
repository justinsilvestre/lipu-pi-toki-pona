// @flow
import type { State } from '../selectors/notifications'
import type { Action } from '../actions'

const initialState: State= {
  error: false,
  syntaxError: false,
}

export default function notifications(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'SHOW_ERROR':
      return {
        ...state,
        error: true,
      }
    case 'HIDE_ERROR':
      return {
        ...state,
        error: false,
      }
    case 'PARSE_SENTENCES_SUCCESS':
      return {
        ...state,
        syntaxError: false,
      }
    case 'PARSE_SENTENCES_FAILURE':
      return {
        ...state,
        syntaxError: true,
      }
    default:
      return state
  }
}
