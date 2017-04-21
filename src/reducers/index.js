// @flow
import { combineReducers } from 'redux'
import type { Sentence, Word, WordId, TpLemmaId } from '../utils/grammar'
import type { SentenceTranslation } from '../utils/english/grammar'
import type { WordsObject } from '../utils/parseTokiPona'
import type { Color } from '../utils/getHighlighting'
import type { Action } from '../actions'
import type { EnglishPartOfSpeech } from '../utils/english/partsOfSpeech'

import mouse, * as M from './mouse'
import tpSentences, * as TpS from './tpSentences'
import tpWords, * as TpW from './tpWords'
import colors, * as C from './colors'
import enSentences, * as EnS from './enSentences'
import tpLemmas, * as TpL from './tpLemmas'
import enLemmas, * as EnL from './enLemmas'
import phraseTranslations, * as PT from './phraseTranslations'
import documentTranslationPhrases, * as DTP from './documentTranslationPhrases'
import notifications, * as N from './notifications'

import type { MouseState } from './mouse'
import type { TpSentencesState } from './tpSentences'
import type { TpWordsState } from './tpWords'
import type { ColorsState } from './colors'
import type { EnSentencesState } from './enSentences'
import type { TpLemmasState } from './tpLemmas'
import type { EnLemmasState } from './enLemmas'
import type { State as PhraseTranslationsState, PhraseTranslationId } from './phraseTranslations'
import type { State as DocumentTranslationPhrasesState } from './documentTranslationPhrases'
import type { State as NotificationsState } from './notifications'

export type AppState = {
  mouse: MouseState,
  tpSentences: TpSentencesState,
  tpWords: TpWordsState,
  tpLemmas: TpLemmasState,
  colors: ColorsState,
  enSentences: EnSentencesState,
  enLemmas: EnLemmasState,
  phraseTranslations: PhraseTranslationsState,
  documentTranslationPhrases: DocumentTranslationPhrasesState,
  notifications: NotificationsState,
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
  documentTranslationPhrases,
  notifications,
})

export default reducer

export const getSentences = (state: AppState): Array<Sentence> => state.tpSentences
export const getWord = (state: AppState, wordId: WordId): Word => state.tpWords[wordId]
const getWordIndex = (state, wordId): number => (getWord(state, wordId) || { index: -1 }).index
export const getSentenceFromWord = (state: AppState, wordId: WordId): Sentence => getSentences(state)[state.tpWords[wordId].sentence]

export const getEnSentence = (state: AppState, index: number): SentenceTranslation => EnS.getEnSentence(state.enSentences, index)

export const getHighlightedWord = (state: AppState): ?Word => {
  const id = M.getHighlightedWord(state.mouse)
  return id ? getWord(state, id) : null
}
export const wasSelectionMade = (state: AppState): boolean => M.wasSelectionMade(state.mouse)
const isWordBetween = (state, wordId, startId, endId): boolean => {
  const wordIndex = getWordIndex(state, wordId)
  return Boolean(
    (startId && endId)
    && getWordIndex(state, startId) <= wordIndex
    && wordIndex <= getWordIndex(state, endId)
  )
}
export const isWordSelected = (state: AppState, wordId: WordId): boolean => {
  const { start, end } = M.getSelection(state.mouse);
  return isWordBetween(state, wordId, start, end)
}
export const isWordInPendingSelection = (state: AppState, wordId: WordId): boolean => {
  const { start, end } = M.getPendingSelection(state.mouse)
  return isWordBetween(state, wordId, start, end)
}
const getIndexInSentence = (state: AppState, wordId: WordId): number =>
  getSentenceFromWord(state, wordId).words.indexOf(wordId)
export const getSelection = (state: AppState): ?Word => {
  const id = M.getSelection(state.mouse).start
  return id ? getWord(state, id) : null
}

export const getWordColor = (state: AppState, wordId: WordId): Color =>
  state.colors[getWord(state, wordId).sentence][getIndexInSentence(state, wordId)]

export const lookUpTranslation = (state: AppState, wordId: WordId) => {
  const phraseTranslationId = state.documentTranslationPhrases[wordId]
  return state.phraseTranslations[phraseTranslationId]
}
export const lookUpTranslations = (state: AppState, tpLemmaId: TpLemmaId, enPartsOfSpeech: ?Array<EnglishPartOfSpeech>) => {
  const result = []
  for (const id in state.phraseTranslations) {
    const translation = state.phraseTranslations[Number(id)]
    const enLemma = state.enLemmas[translation.enLemmaId]
    if (enLemma && tpLemmaId == translation.tpLemmaId && (!enPartsOfSpeech || enPartsOfSpeech.some(pos => enLemma.pos === pos))) {
      result.push(translation)
    }
  }
  return result
}
export const getEnLemmaText = (state: AppState, phraseTranslationId: PhraseTranslationId) => {
  const enLemmaId = state.phraseTranslations[phraseTranslationId].enLemmaId
  const enLemma = state.enLemmas[enLemmaId]
  return enLemma.text
}

export const getTpLemmaId = (state: AppState, text: string, pos: string): ?TpLemmaId => TpL.getId(state.tpLemmas, text, pos)
export const getTpLemmaText = (state: AppState, tpLemmaId: TpLemmaId): string => TpL.getText(state.tpLemmas, tpLemmaId)

export const getTpText = (state: AppState, wordId: WordId): string => {
  const word = getWord(state, wordId)
  const { lemmaId, before, after } = word
  const text = lemmaId ? getTpLemmaText(state, lemmaId) : word.text
  return [before, text, after].join('')
}
