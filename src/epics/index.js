// @flow
import { combineEpics } from 'redux-observable'
import type { Store } from 'redux'
import { Observable } from 'rxjs'
import type { AppState } from '../redux'
import { selectWords, delimitPendingSelection, translateSentences, translateSentencesSuccess } from '../actions'
import type { Action } from '../actions'
import translate from '../utils/translate'
import type { WordsObject } from '../utils/parseTokiPona'
import type { WordId } from '../utils/grammar'
import lookup from '../actions/lookup'

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

const translationEpic = (action$: any, { getState, dispatch }: Store<getStateFn, Action>) => action$
  .ofType('PARSE_SENTENCES')
  .flatMap(() => translate(getState().tpSentences, getState().tpWords, lookup(getState, dispatch)).catch(err => console.warn(err)))
  .map((x) => translateSentencesSuccess(x))

const epic = combineEpics(
  singleWordSelectionEpic,
  multipleWordSelectionEpic,
  translationEpic,
)

export default epic
