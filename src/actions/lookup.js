export type Action =
  { type: 'ADD_TP_WORD' }
  // | { type: 'ADD_PHRASE_TRANSLATION', phraseTranslation: PhraseTranslation }
  // | { type: 'ADD_TP_LEMMA', tpLemma: TpLemma }
  // | { type: 'ADD_EN_LEMMA', enLemma: EnLemma }

export type Lookup = {
  translate: () => Promise<English>
}

export default function lookup(getState, dispatch): Lookup {

}
