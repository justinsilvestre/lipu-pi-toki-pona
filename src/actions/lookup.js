// @flow
import type { PhraseTranslation } from '../reducers/phraseTranslations'
import { lookUpTranslation } from '../reducers'
import channel, { pull } from '../utils/channel'
import type { WordsObject } from '../utils/parseTokiPona'
import type { AppState } from '../reducers'
import type { EnLemma } from '../reducers/enLemmas'
import type { EnglishPartOfSpeech } from '../utils/english/grammar'

export type Action =
  // { type: 'ADD_TP_WORD' }
  | { type: 'ADD_PHRASE_TRANSLATION', phraseTranslation: PhraseTranslation }
  // | { type: 'ADD_TP_LEMMA', tpLemma: TpLemma }
  // | { type: 'ADD_EN_LEMMA', enLemma: EnLemma }

export type Lookup = {
  //temp
  words: WordsObject,

  translate: (tpLemmaId: string) => Promise<{
    enLemma: ?EnLemma,
    phraseTranslation: ?PhraseTranslation,
  }>,
  // tpLemma: () => TpLemma,
  // getAlternateTranslations
}

export const addPhraseTranslation = (phraseTranslation: PhraseTranslation, enLemma: EnLemma): Action => ({
  type: 'ADD_PHRASE_TRANSLATION',
  phraseTranslation,
  enLemma,
})

const normalizeTranslationResponse = ({ phraseTranslation: raw }) => {
  const enLemma = raw && raw.en && {
    id: raw.en.id,
    text: raw.en.text,
    pos: raw.en.pos,
  }
  const phraseTranslation = raw && {
    id: raw.id,
    enLemmaId: raw.en.id,
    tpLemmaId: raw.tp,
  }

  return { enLemma, phraseTranslation }
}

export const fetchTranslation = async (tpLemmaId: string, enPartsOfSpeech: ?Array<EnglishPartOfSpeech>) => {
  const opts = { tpLemmaId, ...(enPartsOfSpeech ? { enPartsOfSpeech } : null) }
  const response = await pull('lookup', opts)
  return normalizeTranslationResponse(response)
}
window.fetchTranslation = fetchTranslation

export default function lookup(getState: Function, dispatch: Function): Lookup {
  const state = getState()
  return {
    words: state.tpWords,
    translate: async (tpLemmaId, enPartsOfSpeech) => {
      if (!Number.isInteger(tpLemmaId)) {
        return { phraseTranslation: { tpLemmaId, enLemmaId: null }, enLemma: { text: tpLemmaId, pos: "n" } }
      }

      const existing = lookUpTranslation(state, tpLemmaId, enPartsOfSpeech)
      if (existing) {
        return { phraseTranslation: existing, enLemma: state.enLemmas[existing.enLemmaId] }
      } else {
        const x = lookUpTranslation
        const { phraseTranslation, enLemma } = await fetchTranslation(tpLemmaId, enPartsOfSpeech)
        dispatch(addPhraseTranslation(phraseTranslation, enLemma))
        return { phraseTranslation, enLemma }
      }
    },
  }
}
