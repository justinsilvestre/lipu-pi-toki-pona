// @flow
import React from 'react'
import cn from 'classnames'
import { connect } from 'react-redux'
import type { ConnectedComponentClass } from 'react-redux'
import { getText, getIndex } from '../utils/grammar'
import type { Word } from '../utils/grammar'
import type { Color } from '../utils/getHighlighting'
import type { AppState } from '../redux/reducer'
import {
  wordMouseEnter, wordMouseLeave, wordMouseDown, wordMouseUp, wordClick,
} from '../redux/actions'

const adjustColor = (selecting: bool, selected: bool, [h, s, l]: Color) : Color =>
  [h, s + (selected ? 1 : 0) * 60, l + (selecting ? 1 : 0) * 40]

type WordOriginalOwnProps = {
  original: Word,
}
type WordOriginalStateProps = {
  pendingSelectionStart: ?Word,
  pendingSelectionEnd: ?Word,
  selectionStart: ?Word,
  selectionEnd: ?Word,
  highlightedWord: ?Word,
  selectionIsPending: bool,
  selectionWasMade: bool,
  color: Color,
}
type WordOriginalDispatchProps = {
  onMouseUp: Function, onMouseDown: Function, onMouseEnter: Function, onMouseLeave: Function, onClick: Function,
}
type WordOriginalProps = WordOriginalOwnProps & WordOriginalStateProps & WordOriginalDispatchProps

const WordOriginal = ({
    original,
    onMouseUp, onMouseDown, onMouseEnter, onMouseLeave, onClick,
    pendingSelectionStart: pss,
    pendingSelectionEnd: pse,
    selectionStart: ss,
    selectionEnd: se,
    highlightedWord,
    selectionIsPending,
    selectionWasMade,
    color,
  }: WordOriginalProps) => {
  const selecting = selectionIsPending && (getIndex(pss) <= getIndex(original) && getIndex(original) <= getIndex(pse))
  const selected = selectionWasMade && (getIndex(ss) <= getIndex(original) && getIndex(original) <= getIndex(se))
  const events = {
    onMouseUp: () => onMouseUp(original),
    onMouseDown: (e) => {
      onMouseDown(original)
      e.preventDefault()
    },
    onMouseEnter: () => onMouseEnter(original),
    onMouseLeave: () => onMouseLeave(original),
    onClick: () => onClick(original)
  }

  const [h, s, l] = adjustColor(selecting, selected, color)
  const style = { color: `hsl(${h}, ${s}%, ${l}%)`, fontWeight: original.role.endsWith('particle') ? 300 : 'normal' }

  return (
    <div className={cn('word', { selecting, selected })}  style={style} {...events}>
      <div>{getText(original)}</div>
    </div>
  )
}

const mapStateToProps = (state: AppState, ownProps: WordOriginalOwnProps) : WordOriginalStateProps => ({
  pendingSelectionStart: state.pendingSelectionStart,
  pendingSelectionEnd: state.pendingSelectionEnd,
  selectionStart: state.selectionStart,
  selectionEnd: state.selectionEnd,
  highlightedWord: state.highlightedWord,
  selectionIsPending: 'pendingSelectionStart' in state,
  selectionWasMade: 'selectionStart' in state,
  color: state.colors[ownProps.original.index],
})
const mapDispatchToProps : WordOriginalDispatchProps = {
  onMouseUp: wordMouseUp,
  onMouseDown: wordMouseDown,
  onMouseEnter: wordMouseEnter,
  onMouseLeave: wordMouseLeave,
  onClick: wordClick,
}

const connected : ConnectedComponentClass<WordOriginalOwnProps, *, *, *> = connect(mapStateToProps, mapDispatchToProps)(WordOriginal)

export default connected
