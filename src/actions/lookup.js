// @flow
import type { PhraseTranslation, State as PhraseTranslationState } from '../selectors/phraseTranslations'
import { lookUpTranslation, getEnWordFromTp } from '../selectors'
import channel, { pull } from '../utils/channel'
import { getWord, isNewProperNoun, getPhraseTranslation, getEnLemma } from '../selectors'
import type { TpWordsState } from '../selectors/tpWords'
import type { AppState } from '../selectors'
import type { EnLemma, EnLemmasState } from '../selectors/enLemmas'
import type { TpLemmaId, TpLemmasState } from '../selectors/tpLemmas'
import type { WordId } from '../selectors/tpWords'
import type { EnglishPartOfSpeech } from '../utils/english/grammar'
import type { EnWord } from '../selectors/enWords'
import { newPlaceholder } from '../selectors/enWords'
import uuid from 'uuid'

export type Action =
  | { type: 'ADD_PHRASE_TRANSLATION', phraseTranslation: PhraseTranslation, enLemma: EnLemma, enWord: EnWord }
  | { type: 'ADD_PHRASE_TRANSLATIONS', phraseTranslations: PhraseTranslationState, enLemmas: EnLemmasState }
  | { type: 'SET_WORD_TRANSLATION', phraseTranslationId: number, wordId: WordId }
  | { type: 'CHANGE_WORD_TRANSLATION', phraseTranslationId: number, wordId: WordId }

export type Lookup = {
  //temp
  words: TpWordsState,
  tpLemmas: TpLemmasState,

  translate: (wordId: WordId, enPartsOfSpeech: ?Array<EnglishPartOfSpeech>) => Promise<{
    enLemma: ?EnLemma,
    phraseTranslation: ?PhraseTranslation,
    enWord: ?EnWord,
  }>,
  // browse: (tpLemmaId: string, enPartsOfSpeech: Array<EnglishPartOfSpeech>) => Promise<Array<PhraseTranslation>>
}

export const addPhraseTranslation = (phraseTranslation: PhraseTranslation, enLemma: EnLemma, enWord: EnWord): Action => ({
  type: 'ADD_PHRASE_TRANSLATION',
  phraseTranslation,
  enLemma,
  enWord,
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

export type RawPhraseTranslation = {
  id: number,
  tp: number,
  en: {
    id: number,
    text: string,
    pos: EnglishPartOfSpeech,
  }
}

export type RawPhraseTranslations = {
  phraseTranslations: Array<RawPhraseTranslation>,
}

export const processTranslationsResponse = ({ phraseTranslations: raw }: RawPhraseTranslations) => {
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

const processTranslationResponse = ({ phraseTranslation: raw }: { phraseTranslation: RawPhraseTranslation }) => {
  const enLemma = {
    id: raw.en.id,
    text: raw.en.text,
    pos: raw.en.pos,
  }
  const phraseTranslation = {
    id: raw.id,
    enLemmaId: raw.en && raw.en.id,
    tpLemmaId: raw.tp,
  }

  return { enLemma, phraseTranslation }
}

export const fetchTranslation = async (tpLemmaId: TpLemmaId, enPartsOfSpeech: ?Array<EnglishPartOfSpeech>) => {
  const opts = { tpLemmaId, ...(enPartsOfSpeech ? { enPartsOfSpeech } : null) }
  const response = await pull('look_up_one', opts)
  return response.phraseTranslation
  ? processTranslationResponse(response)
  : { enLemma: null, phraseTranslation: null }
}
window.fetchTranslation = fetchTranslation
export const fetchTranslations = async (tpLemmaId: string, enPartsOfSpeech: ?Array<EnglishPartOfSpeech>) => {
  const opts = { tpLemmaId, ...(enPartsOfSpeech ? { enPartsOfSpeech } : null) }
  const response = await pull('look_up_many', opts)
  return processTranslationsResponse(response)
}
window.fetchTranslations = fetchTranslations

export default function lookup(getState: Function, dispatch: Function): Lookup {
  const state: AppState = getState()
  return {
    words: state.tpWords,
    tpLemmas: state.tpLemmas,
    translate: async (wordId, enPartsOfSpeech) => {
      const { lemmaId: tpLemmaId, text: tpText } = getWord(getState(), wordId)
      if (!tpLemmaId) throw new Error('whoops')

      const enWordId = uuid()

      if (isNewProperNoun(state, tpLemmaId)) {
        // return { phraseTranslation: { tpLemmaId, enLemmaId: null }, enLemma: { text: tpLemmaId, pos: "prop" } }
        const enWord = newPlaceholder(enWordId, tpText, wordId)
        return { phraseTranslation: null, enLemma: null, enWord }
      }

      const existingEnWord = getEnWordFromTp(state, wordId)
      const existingTranslationIsValid = existingEnWord
        && existingEnWord.hasOwnProperty('phraseTranslationId')
        && (!enPartsOfSpeech || enPartsOfSpeech.includes(existingEnWord.pos))
      if (existingTranslationIsValid) {
        if (!existingEnWord) throw new Error('whoops')
        if (!existingEnWord.phraseTranslationId) throw new Error('whoops')

        const phraseTranslation = getPhraseTranslation(state, existingEnWord.phraseTranslationId)
        const enLemma = getEnLemma(state, phraseTranslation.enLemmaId)
        return {
          phraseTranslation,
          enLemma,
          enWord: existingEnWord,
        }
      } else {
        const { phraseTranslation, enLemma } = await fetchTranslation(tpLemmaId, enPartsOfSpeech)
        const enWord: ?EnWord = (phraseTranslation && enLemma) ? {
          id: enWordId,
          pos: enLemma.pos,
          text: enLemma.text,
          phraseTranslationId: phraseTranslation.id,
        } : null

        // {
        //   id: enWordId,
        //   text,
        //   pos: 'n',
        //   tpWordId: wordId,
        // }

        if (enWord && existingEnWord && phraseTranslation && enLemma)
          dispatch(addPhraseTranslation(phraseTranslation, enLemma, enWord))
        else
          dispatch({ type: 'INVALID_OPTION' })

        phraseTranslation
          && getState().documentTranslationPhrases[wordId] !== phraseTranslation.id
          && dispatch(setWordTranslation(wordId, phraseTranslation.id))
        return { phraseTranslation, enLemma, enWord }
      }
    },
    // browse: async (tpLemmaId, enPartsOfSpeech) => {
    // }
  }
}
