// @flow
import type { PhraseTranslation, State as PhraseTranslationState } from '../selectors/phraseTranslations'
import { lookUpTranslation } from '../selectors'
import channel, { pull } from '../utils/channel'
import { getWord } from '../selectors'
import type { WordsObject } from '../utils/parseTokiPona'
import type { AppState } from '../selectors'
import type { EnLemma, EnLemmasState } from '../selectors/enLemmas'
import type { TpLemmasState } from '../selectors/tpLemmas'
import type { WordId } from '../utils/grammar'
import type { EnglishPartOfSpeech } from '../utils/english/grammar'

export type Action =
  | { type: 'ADD_PHRASE_TRANSLATION', phraseTranslation: PhraseTranslation, enLemma: EnLemma }
  | { type: 'ADD_PHRASE_TRANSLATIONS', phraseTranslation: PhraseTranslationState, enLemma: EnLemmasState }
  | { type: 'SET_WORD_TRANSLATION', phraseTranslationId: number, wordId: WordId }
  | { type: 'CHANGE_WORD_TRANSLATION', phraseTranslationId: number, wordId: WordId }

export type Lookup = {
  //temp
  words: WordsObject,
  tpLemmas: TpLemmasState,

  translate: (wordId: string, enPartsOfSpeech: ?Array<EnglishPartOfSpeech>) => Promise<{
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

export const addPhraseTranslations = (phraseTranslations: PhraseTranslationState, enLemmas: EnLemmasState): Action => ({
  type: 'ADD_PHRASE_TRANSLATIONS',
  phraseTranslations,
  enLemmas,
})

export const setWordTranslation = (wordId: WordId, phraseTranslationId: number) : Action => ({
  type: 'SET_WORD_TRANSLATION',
  wordId,
  phraseTranslationId,
})
export const changeWordTranslation = (wordId: WordId, phraseTranslationId: number) : Action => ({
  type: 'CHANGE_WORD_TRANSLATION',
  wordId,
  phraseTranslationId,
})

export const processTranslationsResponse = ({ phraseTranslations: raw }) => {
  const enLemmas = {}
  const phraseTranslations = {}
  for (const rawPhraseTranslation of raw) {
    const { id, en: rawEnLemma, tp: tpLemmaId } = rawPhraseTranslation
    const { id: enLemmaId, text, pos } = rawEnLemma
    phraseTranslations[id] = {
      id,
      tpLemmaId,
      enLemmaId,
    }
    enLemmas[enLemmaId] = {
      id: enLemmaId,
      text,
      pos,
    }
  }
  return { phraseTranslations, enLemmas}
}

const processTranslationResponse = ({ phraseTranslation: raw }) => {
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
  return processTranslationResponse(response)
}
window.fetchTranslation = fetchTranslation
export const fetchTranslations = async (tpLemmaId: string, enPartsOfSpeech: ?Array<EnglishPartOfSpeech>) => {
  const opts = { tpLemmaId, ...(enPartsOfSpeech ? { enPartsOfSpeech } : null) }
  const response = await pull('look_up_many', opts)
  return processTranslationResponse(response)
}
window.fetchTranslations = fetchTranslations

export default function lookup(getState: Function, dispatch: Function): Lookup {
  const state: AppState = getState()
  return {
    words: state.tpWords,
    tpLemmas: state.tpLemmas,
    translate: async (wordId, enPartsOfSpeech) => {
      const tpLemmaId = getWord(getState(), wordId).lemmaId
      if (!Number.isInteger(tpLemmaId)) {
        return { phraseTranslation: { tpLemmaId, enLemmaId: null }, enLemma: { text: tpLemmaId, pos: "prop" } }
      }

      const existing = lookUpTranslation(state, wordId)
      if (existing
        && enPartsOfSpeech
        && enPartsOfSpeech.includes(state.enLemmas[existing.enLemmaId] && state.enLemmas[existing.enLemmaId].pos)
      ) {
        return { phraseTranslation: existing, enLemma: state.enLemmas[existing.enLemmaId] }
      } else {
        const { phraseTranslation, enLemma } = await fetchTranslation(tpLemmaId, enPartsOfSpeech)

        if (existing)
          dispatch(addPhraseTranslation(phraseTranslation, enLemma))
        else
          dispatch({ type: 'INVALID_OPTION' })

        phraseTranslation
          && getState().documentTranslationPhrases[wordId] !== phraseTranslation.id
          && dispatch(setWordTranslation(wordId, phraseTranslation.id))
        return { phraseTranslation, enLemma }
      }
    },
    browse: async (tpLemmaId, enPartsOfSpeech) => {
    }
  }
}
