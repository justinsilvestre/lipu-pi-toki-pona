// @flow
import { combineEpics } from 'redux-observable'
import type { Store } from 'redux'
import { Observable } from 'rxjs'
import type { AppState } from '../redux'
import { selectWords, delimitPendingSelection, translateSentences, translateSentencesSuccess, deselect } from '../actions'
import type { Action } from '../actions'
import translate from '../utils/translate'
import type { WordsObject } from '../utils/parseTokiPona'
import type { WordId } from '../utils/grammar'
import lookup from '../actions/lookup'
import { wasSelectionMade, getSelection, getWord } from '../reducers'
import { pull } from '../utils/channel'
//
const sortByIndex = (words: WordsObject, word1: WordId, word2: WordId) : Array<WordId> =>
[word1, word2].sort((a, b) => {
  const i1 = words[a].index
  const i2 = words[b].index
  return i1 < i2 ? -1 : 1
})

type getStateFn = () => AppState
const multipleWordSelectionEpic = (action$: any, { getState }: Store<getStateFn, Action>) => action$
  .ofType('WORD_MOUSE_DOWN')
  .concatMap((mouseDown) => action$
    .ofType('WORD_MOUSE_ENTER')
    .takeUntil(action$.ofType('WORD_MOUSE_UP').merge(Observable.fromEvent(window, 'mouseup')))
    .map((mouseEnter) => delimitPendingSelection(...sortByIndex(getState().tpWords, mouseEnter.word, mouseDown.word)))
    .concat(Observable.of(selectWords()))
  )

const singleWordSelectionEpic = (action$: any, { getState }: Store<getStateFn, Action>) => action$
  .ofType('WORD_MOUSE_DOWN')
  .takeUntil(action$.ofType('WORD_MOUSE_ENTER')).repeat()
  .map((mouseDown) => delimitPendingSelection(mouseDown.word, mouseDown.word))
  .concat(Observable.of(selectWords()))

const deselectionEpic = (action$: any) => action$
  .ofType('WORD_MOUSE_LEAVE')
  .concatMap(ml => Observable.fromEvent(window, 'click').takeUntil(action$.ofType('WORD_MOUSE_ENTER')))
  .map(x => deselect())

const translationEpic = (action$: any, { getState, dispatch }: Store<getStateFn, Action>) => action$
  .ofType('PARSE_SENTENCES')
  .flatMap(() => translate(getState().tpSentences, getState().tpWords, lookup(getState, dispatch)).catch(err => console.error(err)))
  .map((x) => translateSentencesSuccess(x))

const phraseTranslationEpic = (action$: any, { getState }) => action$
  .ofType('SELECT_WORDS')
  .filter(() => wasSelectionMade(getState()))
  .flatMap(() => {
    const state = getState()
    const selectedWord = getSelection(state)
    return pull('look_up_many', { tpLemmaId: selectedWord.lemmaId })
  }).map(({ phraseTranslations: raw }) => {
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
    return {
      type: 'ADD_PHRASE_TRANSLATIONS',
      enLemmas,
      phraseTranslations,
    }})

const epic = combineEpics(
  singleWordSelectionEpic,
  multipleWordSelectionEpic,
  deselectionEpic,
  translationEpic,
  phraseTranslationEpic,
)
export default epic
