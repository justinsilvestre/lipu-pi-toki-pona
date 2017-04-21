// @flow
import type { Action } from '../actions'

export type TpLemma = {
  text: string,
  id: string,
  pos: string,
  animacy: ?boolean,
  primary: ?string,
}
export type TpLemmasState = {
  [id: string]: TpLemma
}

export const getId = (state: TpLemmasState, text: string, pos: string): ?string => {
  for (const k in state) {
    const l = state[k]
    if (l.text === text && l.pos === pos) {
      return l.id
    }
  }
}
export const getText = (state: TpLemmasState, id: string): string => {
  if (!state[id]) throw new Error('whoops')
  return state[id].text
}
