// @flow
import type { Action } from '../actions'

export type EnLemma = {
  id: string,
  text: string,
  pos: string,
}
export type EnLemmasState = {
  [id: string]: EnLemma
}

export default function enLemmas(state: EnLemmasState = {}, action: Action): EnLemmasState {
  switch (action.type) {
    case 'ADD_PHRASE_TRANSLATION':
    if (!action.enLemma || state[action.enLemma.id]) return state
    return {
      ...state,
      [action.enLemma.id]: action.enLemma,
    }
    default:
      return state
  }
}
