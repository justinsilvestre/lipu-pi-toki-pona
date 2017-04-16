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
        // [action.phraseTranslation.id]: {
        //   id: action.phraseTranslation.id,
        //   enLemmaId: action.phraseTranslation.en.id,
        //   tpLemmaId: action.phraseTranslation.tp,
        // },
      }
    default:
      return state
  }
}

// export const lookUpTranslation = (state: State, tpLemmaId: string, enPartsOfSpeech: Array<EnPartOfSpeech>): ?PhraseTranslation => {
//   const values: any = Object.values(state)
//   const values_ = (values: Array<PhraseTranslation>)
//   return values.find((pt) => pt.tpLemmaId === tpLemmaId)
// }