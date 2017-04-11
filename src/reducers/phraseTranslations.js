

export type PhraseTranslation = {
  id: string,
  enLemmaId: string,
  tpLemmaId: string,
}

export type PhraseTranslationsState = {
  [id: string]: PhraseTranslation,
}

export function phraseTranslations(state: PhraseTranslationsState, action: Action): PhraseTranslationsState {
  switch (action.type) {
    case 'ADD_PHRASE_TRANSLATION':
      return {
        ...state,
        [action.id]: action.phraseTranslation,
      }
    default:
      return state
  }
}
