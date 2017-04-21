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
