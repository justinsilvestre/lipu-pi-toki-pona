// @flow
import type { Action } from '../actions'
import type { EnglishPartOfSpeech } from '../utils/english/partsOfSpeech'
import type { PhraseTranslationId } from './phraseTranslations'

export type EnWord = {
  before?: string,
  after?: string,
  lemmaId: EnLemmaId,
  pos: string,
  text: string,
  phraseTranslationId?: PhraseTranslationId,
}
//
// }
//
// export default function enLemmas(state: EnLemmasState = {}, action: Action): EnLemmasState {
//   switch (action.type) {
//     case 'ADD_PHRASE_TRANSLATION':
//     if (!action.enLemma || state[action.enLemma.id]) return state
//     return {
//       ...state,
//       [action.enLemma.id]: action.enLemma,
//     }
//     case 'ADD_PHRASE_TRANSLATIONS':
//       // shouldn't add more if already there
//       return {
//         ...state,
//         ...action.enLemmas,
//       }
//     default:
//       return state
//   }
// }
