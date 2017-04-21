// @flow
import type { Action } from '../actions'

export type PhraseTranslationId = number
export type PhraseTranslation = {
  id: PhraseTranslationId,
  enLemmaId: number,
  tpLemmaId: number,
}

export type State = {
  [id: PhraseTranslationId]: PhraseTranslation,
}

export default function phraseTranslations(state: State = {}, action: Action): State {
  switch (action.type) {
    case 'ADD_PHRASE_TRANSLATION':
      if (!action.phraseTranslation || state[action.phraseTranslation.id]) return state
      return {
        ...state,
        [action.phraseTranslation.id]: action.phraseTranslation,
      }
    case 'ADD_PHRASE_TRANSLATIONS':
      // shouldn't add more if already there
      return {
        ...state,
        ...action.phraseTranslations,
      }
    default:
      return state
  }
}
