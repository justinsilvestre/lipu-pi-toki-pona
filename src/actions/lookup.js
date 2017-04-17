// @flow
import type { PhraseTranslation } from '../reducers/phraseTranslations'
import { lookUpTranslation } from '../reducers'
import channel, { pull } from '../utils/channel'
import type { WordsObject } from '../utils/parseTokiPona'
import type { AppState } from '../reducers'
import type { EnLemma } from '../reducers/enLemmas'
import type { TpLemmasState } from '../reducers/tpLemmas'
import type { EnglishPartOfSpeech } from '../utils/english/grammar'

export type Action =
  | { type: 'ADD_PHRASE_TRANSLATION', phraseTranslation: PhraseTranslation }

export type Lookup = {
  //temp
  words: WordsObject,
  tpLemmas: TpLemmasState,

  translate: (tpLemmaId: string, enPartsOfSpeech: ?Array<EnglishPartOfSpeech>) => Promise<{
    enLemma: ?EnLemma,
    phraseTranslation: ?PhraseTranslation,
  }>,
  browse: (tpLemmaId: string, enPartsOfSpeech: Array<EnglishPartOfSpeech>) => Promise<Array<PhraseTranslation>>
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
    enLemmaId: raw.en && raw.en.id,
    tpLemmaId: raw.tp,
  }

  return { enLemma, phraseTranslation }
}

export const fetchTranslation = async (tpLemmaId: string, enPartsOfSpeech: ?Array<EnglishPartOfSpeech>) => {
  const opts = { tpLemmaId, ...(enPartsOfSpeech ? { enPartsOfSpeech } : null) }
  const response = await pull('look_up_one', opts)
  return normalizeTranslationResponse(response)
}
window.fetchTranslation = fetchTranslation
export const fetchTranslations = async (tpLemmaId: string, enPartsOfSpeech: ?Array<EnglishPartOfSpeech>) => {
  const opts = { tpLemmaId, ...(enPartsOfSpeech ? { enPartsOfSpeech } : null) }
  const response = await pull('look_up_many', opts)
  return normalizeTranslationResponse(response)
}
window.fetchTranslations = fetchTranslations

export default function lookup(getState: Function, dispatch: Function): Lookup {
  const state: AppState = getState()
  return {
    words: state.tpWords,
    tpLemmas: state.tpLemmas,
    translate: async (tpLemmaId, enPartsOfSpeech) => {
      if (!Number.isInteger(tpLemmaId)) {
        return { phraseTranslation: { tpLemmaId, enLemmaId: null }, enLemma: { text: tpLemmaId, pos: "prop" } }
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
    browse: async (tpLemmaId, enPartsOfSpeech) => {
      // const options = await fetchTranslations(tpLemmaId, enPartsOfSpeech)
    }
  }
}
