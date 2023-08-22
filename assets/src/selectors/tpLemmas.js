// @flow

export type ProperNounLemmaId = string
export type TpLemmaId = number | ProperNounLemmaId
export type TpLemma = {
  text: string,
  id: TpLemmaId,
  pos: string,
  animacy: ?boolean,
  primary: ?string,
}
export type TpLemmasState = {
  [id: TpLemmaId]: TpLemma
}

export const getId = (state: TpLemmasState, text: string, pos: string): ?TpLemmaId => {
  for (const k in state) {
    const l = state[k]
    if (l.text === text && l.pos === pos) {
      return l.id
    }
  }
}
export const getText = (state: TpLemmasState, id: TpLemmaId): string => {
  if (!state[id]) throw new Error('whoops')
  return state[id].text
}
