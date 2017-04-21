// @flow
import type { SentenceTranslation } from '../utils/english/grammar'
import type { Action } from '../actions'

export type EnSentencesState = Array<SentenceTranslation>

export const getEnSentence = (state: EnSentencesState, index: number): SentenceTranslation => state[index]
