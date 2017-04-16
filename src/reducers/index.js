// @flow
import { combineReducers } from 'redux'
import type { Sentence, Word, WordId } from '../utils/grammar'
import type { SentenceTranslation } from '../utils/english/grammar'
import type { WordsObject } from '../utils/parseTokiPona'
import type { Color } from '../utils/getHighlighting'
import type { Action } from '../actions'
import type { EnglishPartOfSpeech } from '../utils/english/grammar'

import mouse, * as mouseSelectors from './mouse'
import tpSentences, * as tpSentencesSelectors from './tpSentences'
import tpWords, * as tpWordsSelectors from './tpWords'
import colors, * as colorsSelectors from './colors'
import enSentences, * as enSentencesSelectors from './enSentences'
import tpLemmas, * as tpLemmasSelectors from './tpLemmas'
import enLemmas, * as enLemmasSelectors from './enLemmas'
import phraseTranslations, * as phraseTranslationsSelectors from './phraseTranslations'

import type { MouseState } from './mouse'
import type { TpSentencesState } from './tpSentences'
import type { TpWordsState } from './tpWords'
import type { ColorsState } from './colors'
import type { EnSentencesState } from './enSentences'
import type { TpLemmasState } from './tpLemmas'
import type { EnLemmasState } from './enLemmas'
import type { State as PhraseTranslationsState } from './phraseTranslations'

export type AppState = {
  mouse: MouseState,
  tpSentences: TpSentencesState,
  tpWords: TpWordsState,
  tpLemmas: TpLemmasState,
  colors: ColorsState,
  enSentences: EnSentencesState,
  enLemmas: EnLemmasState,
  phraseTranslations: PhraseTranslationsState,
}

type Reducer = (state: AppState, action: Action) => AppState

const reducer = combineReducers({
  mouse,
  tpSentences,
  tpWords,
  tpLemmas,
  colors,
  enSentences,
  enLemmas,
  phraseTranslations,
})

export default reducer

export const getSentences = (state: AppState): Array<Sentence> => state.tpSentences
export const getWord = (state: AppState, wordId: WordId): Word => state.tpWords[wordId]
const getWordIndex = (state, wordId): number => (getWord(state, wordId) || { index: -1 }).index
const getSentenceFromWord = (state: AppState, wordId: WordId): Sentence => getSentences(state)[state.tpWords[wordId].sentence]

export const getEnSentence = (state: AppState, index: number): SentenceTranslation => enSentencesSelectors.getEnSentence(state.enSentences, index)

export const getHighlightedWord = (state: AppState): ?Word => {
  const id = mouseSelectors.getHighlightedWord(state.mouse)
  return id ? getWord(state, id) : null
}
export const wasSelectionMade = (state: AppState): boolean => mouseSelectors.wasSelectionMade(state.mouse)
const isWordBetween = (state, wordId, startId, endId): boolean => {
  const wordIndex = getWordIndex(state, wordId)
  return Boolean(
    (startId && endId)
    && getWordIndex(state, startId) <= wordIndex
    && wordIndex <= getWordIndex(state, endId)
  )
}
export const isWordSelected = (state: AppState, wordId: WordId): boolean => {
  const { start, end } = mouseSelectors.getSelection(state.mouse);
  return isWordBetween(state, wordId, start, end)
}
export const isWordInPendingSelection = (state: AppState, wordId: WordId): boolean => {
  const { start, end } = mouseSelectors.getPendingSelection(state.mouse)
  return isWordBetween(state, wordId, start, end)
}
const getIndexInSentence = (state: AppState, wordId: WordId): number =>
  getSentenceFromWord(state, wordId).words.indexOf(wordId)

export const getWordColor = (state: AppState, wordId: WordId): Color =>
  state.colors[getWord(state, wordId).sentence][getIndexInSentence(state, wordId)]

export const lookUpTranslation = (state: AppState, tpLemmaId: string, enPartsOfSpeech: Array<EnglishPartOfSpeech>) => {
  for (const id in state.phraseTranslations) {
    const translation = state.phraseTranslations[id]
    const enLemma = state.enLemmas[translation.enLemmaId]
    if (enLemma && tpLemmaId == translation.tpLemmaId && (!enPartsOfSpeech || enPartsOfSpeech.some(pos => enLemma.pos === pos))) {
      return translation
    }
  }
}
  // state.phraseTranslations
  // phraseTranslationsSelectors.lookUpTranslation(state.phraseTranslations, tpLemmaId, enPartsOfSpeech)

export const getTpLemmaId = (state: AppState, text: string, pos: string): ?string => tpLemmasSelectors.getId(state.tpLemmas, text, pos)
export const getTpLemmaText = (state: AppState, tpLemmaId: string): string => tpLemmasSelectors.getText(state.tpLemmas, tpLemmaId)

export const getTpText = (state: AppState, wordId: WordId): string => {
  const word = getWord(state, wordId)
  const { lemmaId } = word
  return lemmaId ? getTpLemmaText(state, lemmaId) : word.text
}
