// @flow
import type { Action } from '../actions'
import type { TpLemmaId, TpLemma } from '../utils/grammar'

export type TpLemmasState = {
  [id: TpLemmaId]: TpLemma
}

export default function tpLemmas(state: TpLemmasState = {}, action: Action): TpLemmasState {
  switch (action.type) {
    case 'PARSE_SENTENCES_SUCCESS':
      if (action.properNouns.length) {
        const newState = { ...state }
        action.properNouns.forEach(pn => newState[pn.id] = pn)
        return newState
      } else {
        return state
      }
    default:
      return state
  }
}

export const getId = (state: TpLemmasState, text: string, pos: string): ?TpLemmaId => {
  for (const k in state) {
    const l = state[Number(k)]
    if (l.text === text && l.pos === pos) {
      return l.id
    }
  }
}
export const getText = (state: TpLemmasState, id: TpLemmaId): string => {
  if (!state[id]) throw new Error('whoops')
  return state[id].text
}
