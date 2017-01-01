// @flow
import { combineEpics } from 'redux-observable'
import type { Store } from 'redux'
import { Observable } from 'rxjs'
import type { AppState } from './index'
import { selectWords, delimitPendingSelection, translateSentences } from './actions'
import type { Action } from './actions'
import translate from '../utils/translate'

type getStateFn = () => AppState
const multipleWordSelectionEpic = (action$: any, { getState }: Store<getStateFn, Action>) => action$
  .ofType('WORD_MOUSE_DOWN')
  .concatMap((mouseDown) => action$
    .ofType('WORD_MOUSE_ENTER')
    .takeUntil(action$.ofType('WORD_MOUSE_UP').merge(Observable.fromEvent(window, 'mouseup')))
    .map((mouseEnter) => delimitPendingSelection(mouseEnter.word, mouseDown.word))
    .concat(Observable.of(selectWords()))
  )
const singleWordSelectionEpic = (action$: any, { getState }: Store<getStateFn, Action>) => action$
  .ofType('WORD_MOUSE_DOWN')
  .takeUntil(action$.ofType('WORD_MOUSE_ENTER')).repeat()
  .map((mouseDown) => delimitPendingSelection(mouseDown.word, mouseDown.word))
  .concat(Observable.of(selectWords()))

const translationEpic = (action$: any, { getState }: Store<getStateFn, Action>) => action$
  .ofType('PARSE_SENTENCES')
  .map(() => translateSentences(translate(getState().tpSentences)))

const epic = combineEpics(
  singleWordSelectionEpic,
  multipleWordSelectionEpic,
  translationEpic,
)

export default epic
