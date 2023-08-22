import type { State } from "../selectors/phraseTranslations";
import type { Action } from "../actions";

export default function phraseTranslations(
  state: State = {},
  action: Action
): State {
  switch (action.type) {
    // case 'TRANSLATE_SENTENCES_SUCCESS': {
    //   const phraseTranslations = {}
    //   action.enWords.forEach((words) => words.forEach(w => {
    //     if (w.phraseTranslationId) phraseTranslations[w.phraseTranslationId] =
    //   }))
    //   return {
    //     ...phraseTranslations,
    //     ...state,
    //   }
    // }
    case "ADD_PHRASE_TRANSLATION":
      if (!action.phraseTranslation || state[action.phraseTranslation.id])
        return state;
      return {
        ...state,
        [action.phraseTranslation.id]: action.phraseTranslation,
      };
    case "ADD_PHRASE_TRANSLATIONS":
      // shouldn't add more if already there
      return {
        ...state,
        ...action.phraseTranslations,
      };
    default:
      return state;
  }
}
