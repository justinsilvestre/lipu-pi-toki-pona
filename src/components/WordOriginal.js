// @flow
import React from 'react'
import cn from 'classnames'
import { connect } from 'react-redux'
import type { ConnectedComponentClass } from 'react-redux'
import { getText, getIndex } from '../utils/parseTokiPona'
import type { Word, WordId } from '../utils/grammar'
import type { Color } from '../utils/getHighlighting'
import type { AppState } from '../redux/reducer'
import { isWordSelected, isWordInPendingSelection } from '../redux/reducer'
import {
  wordMouseEnter, wordMouseLeave, wordMouseDown, wordMouseUp, wordClick,
} from '../redux/actions'

const adjustColor = (selecting: bool, selected: bool, [h, s, l]: Color) : Color =>
  [h, s + (selected || selecting ? 1 : 0) * 60, l + (selecting ? 1 : 0) * 20]

type WordOriginalOwnProps = {
  originalId: WordId,
}
type WordOriginalStateProps = {
  highlightedWord: ?Word,
  color: Color,
  original: Word,
  selecting: boolean,
  selected: boolean,
}
type WordOriginalDispatchProps = {
  onMouseUp: Function, onMouseDown: Function, onMouseEnter: Function, onMouseLeave: Function, onClick: Function,
}
type WordOriginalProps = WordOriginalOwnProps & WordOriginalStateProps & WordOriginalDispatchProps

const WordOriginal = ({
    original,
    originalId,
    onMouseUp, onMouseDown, onMouseEnter, onMouseLeave, onClick,
    color,
    selecting,
    selected,
  }: WordOriginalProps) => {
  const events = {
    onMouseUp: () => onMouseUp(originalId),
    onMouseDown: (e) => {
      onMouseDown(originalId)
      e.preventDefault()
    },
    onMouseEnter: () => onMouseEnter(originalId),
    onMouseLeave: () => onMouseLeave(originalId),
    onClick: () => onClick(originalId)
  }
  const [h, s, l] = adjustColor(selecting, selected, color)
  const style = { color: `hsl(${h}, ${s}%, ${l}%)`, fontWeight: original.role.endsWith('particle') ? 300 : 'normal' }

  // <span className={cn('word', { selecting, selected })}  style={style} {...events}>
  return (
    <span className={cn('word')}  style={style} {...events}>
      {getText(original)}{' '}
    </span>
  )
}

const mapStateToProps = (state: AppState, { originalId }: WordOriginalOwnProps) : WordOriginalStateProps => {
  const original = state.tpWords[originalId]
  return ({
    highlightedWord: state.highlightedWord,
    color: state.colors[original.sentence][state.tpSentences[original.sentence].words.indexOf(originalId)],
    original,
    selecting: isWordInPendingSelection(state, originalId),
    selected: isWordSelected(state, originalId),
})
}
const mapDispatchToProps : WordOriginalDispatchProps = {
  onMouseUp: wordMouseUp,
  onMouseDown: wordMouseDown,
  onMouseEnter: wordMouseEnter,
  onMouseLeave: wordMouseLeave,
  onClick: wordClick,
}

const connected : ConnectedComponentClass<WordOriginalOwnProps, *, *, *> = connect(mapStateToProps, mapDispatchToProps)(WordOriginal)

export default connected
