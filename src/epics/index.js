// @flow
import { combineEpics } from 'redux-observable'
import type { Store } from 'redux'
import { Observable } from 'rxjs'
import type { AppState } from '../redux'
import {
  selectWords, delimitPendingSelection, translateSentences, translateSentencesSuccess,
  deselect, processTranslationsResponse, addPhraseTranslations,
  parseSentencesSuccess, parseSentencesFailure,
} from '../actions'
import type { Action } from '../actions'
import translate from '../utils/translate'
import type { TpWordsState } from '../selectors/tpWords'
import type { WordId } from '../selectors/tpWords'
import lookup from '../actions/lookup'
import { wasSelectionMade, getSelection, getWord, getSentenceFromWord, getHighlightedWord } from '../selectors'
import { pull } from '../utils/channel'
import parseTokiPona from '../utils/parseTokiPona'

const sortByIndex = (words: TpWordsState, word1: WordId, word2: WordId) : Array<WordId> =>
[word1, word2].sort((a, b) => {
  if (!words[a] || !words[b]) return 0
  const i1 = words[a].index
  const i2 = words[b].index
  return i1 < i2 ? -1 : 1
})

type getStateFn = () => AppState
const multipleWordSelectionEpic = (action$: any, { getState }: Store<getStateFn, Action>) => action$
  .ofType('WORD_MOUSE_DOWN')
  .concatMap((mouseDown) => action$
    .ofType('WORD_MOUSE_ENTER').merge(action$.ofType('PARSE_SENTENCES_SUCCESS'))
    .takeUntil(action$.ofType('WORD_MOUSE_UP').merge(Observable.fromEvent(window, 'mouseup')))
    .map((mouseEnter) => delimitPendingSelection(...sortByIndex(getState().tpWords, mouseEnter.word, mouseDown.word)))
    .concat(Observable.of(selectWords()))
  )

const singleWordSelectionEpic = (action$: any, { getState }: Store<getStateFn, Action>) => action$
  .ofType('WORD_MOUSE_DOWN')
  .takeUntil(action$.ofType('WORD_MOUSE_ENTER')).repeat()
  .map((mouseDown) => delimitPendingSelection(mouseDown.word, mouseDown.word))
  .concat(Observable.of(selectWords()))

const deselectionEpic = (action$: any, { getState }) => Observable.fromEvent(window, 'click')
  .filter(() => !getHighlightedWord(getState()))
  .map(() => ({ ...deselect(), from: 'depci' }))

const parsingEpic = (action$: any, { getState }) => action$
  .ofType('PARSE_SENTENCES')
  .flatMap(({ text }) => {
    let result
    try {
      const trimmed = text.trim().replace(/[^\w\s\.\!\?\;\:\,]/g, '')
      const { sentences, words, properNouns } = parseTokiPona(trimmed, getState().tpLemmas)
      result = parseSentencesSuccess(sentences, words, properNouns)
    } catch(err) {
      result = parseSentencesFailure()
    }
    return Observable.of({ type: 'CLEAR_EN_SENTENCES' }, result)
  })


const translationEpic = (action$: any, { getState, dispatch }: Store<getStateFn, Action>) => action$
  .ofType('PARSE_SENTENCES_SUCCESS')
  .flatMap(() => translate(getState().tpSentences, getState().tpWords, lookup(getState, dispatch)).catch(err => console.error(err)))
  .map((x) => translateSentencesSuccess(x))

const phraseTranslationEpic = (action$: any, { getState }) => action$
  .ofType('SELECT_WORDS')
  .filter(() => wasSelectionMade(getState()))
  .flatMap(() => {
    const state = getState()
    const selectedWord = getSelection(state)
    return selectedWord ?
      pull('look_up_many', { tpLemmaId: selectedWord.lemmaId })
      : Promise.resolve(null)
  }).filter(r => r).map((response) => {
    const { enLemmas, phraseTranslations } = processTranslationsResponse(response)
    return addPhraseTranslations(phraseTranslations, enLemmas)
  })

const updateSentenceEpic = (action$: any, { getState, dispatch }) => action$
  .ofType('PARSE_SENTENCES_SUCCESS')
  .flatMap(() =>
    action$.ofType('CHANGE_WORD_TRANSLATION')
    .takeUntil(action$.ofType('TRANSLATE_SENTENCES'))
    .skipUntil(action$.ofType('TRANSLATE_SENTENCES_SUCCESS'))
  )
  .flatMap(async ({ wordId }) => {
    const state = getState()
    const { tpSentences, tpWords } = state
    const sentence = getSentenceFromWord(state, wordId)
    const { index } = sentence
    try {
      const [newSentence] = await translate([tpSentences[index]], tpWords, lookup(getState, dispatch))
      return { type: 'UPDATE_SENTENCE', sentence: newSentence, index }
    } catch(err) {
      console.error(err)
      return { type: 'UPDATE_SENTENCE_FAILURE', err }
    }
  })

const updateSentenceSuccessEpic = (action$) => action$
  .ofType('UPDATE_SENTENCE')
  .map(() => deselect())

const epic = combineEpics(
  singleWordSelectionEpic,
  multipleWordSelectionEpic,
  deselectionEpic,
  translationEpic,
  phraseTranslationEpic,
  updateSentenceEpic,
  updateSentenceSuccessEpic,
  parsingEpic,
)
export default epic
