// @flow
import type { Action } from '../actions'

export type PhraseTranslation = {
  id: string,
  enLemmaId: string,
  tpLemmaId: string,
}

export type State = {
  [id: string]: PhraseTranslation,
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
