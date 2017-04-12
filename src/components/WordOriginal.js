// @flow
import React, { Component } from 'react'
import cn from 'classnames'
import { connect } from 'react-redux'
import type { ConnectedComponentClass } from 'react-redux'
import { getText } from '../utils/parseTokiPona'
import type { Word, WordId } from '../utils/grammar'
import type { Color } from '../utils/getHighlighting'
import type { AppState } from '../reducers'
import { getWord, getHighlightedWord, isWordSelected, isWordInPendingSelection, getWordColor } from '../reducers'
import {
  wordMouseEnter, wordMouseLeave, wordMouseDown, wordMouseUp, wordClick,
} from '../actions'

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

class WordOriginal extends Component {
  props : WordOriginalProps
  mouseEvents: { [onMouseEvent: string]: (e: Event) => void }

  constructor(props) {
    super(props)

    const { originalId, onMouseUp, onMouseDown, onMouseEnter, onMouseLeave, onClick } = this.props

    this.mouseEvents = {
      onMouseEnter: () => onMouseEnter(originalId),
      onMouseLeave: () => onMouseLeave(originalId),
      onClick: () => onClick(originalId),
      onMouseUp: () => onMouseUp(originalId),
      onMouseDown: (e) => {
        onMouseDown(originalId)
        e.preventDefault()
      },
    }
  }

  render() {
    const { mouseEvents } = this
    const { original, color, selecting, selected } = this.props
    const [h, s, l] = adjustColor(selecting, selected, color)
    const style = { color: `hsl(${h}, ${s}%, ${l}%)`, fontWeight: original.role.endsWith('particle') ? 300 : 'normal' }

    return (
      <span className={cn('word', { selecting, selected })}  style={style} {...mouseEvents}>
        {getText(original)}{' '}
      </span>
    )
  }
}

const mapStateToProps = (state: AppState, { originalId }: WordOriginalOwnProps) : WordOriginalStateProps => ({
  highlightedWord: getHighlightedWord(state),
  color: getWordColor(state, originalId),
  original: getWord(state, originalId),
  selecting: isWordInPendingSelection(state, originalId),
  selected: isWordSelected(state, originalId),
})

const mapDispatchToProps : WordOriginalDispatchProps = {
  onMouseUp: wordMouseUp,
  onMouseDown: wordMouseDown,
  onMouseEnter: wordMouseEnter,
  onMouseLeave: wordMouseLeave,
  onClick: wordClick,
}

const connected : ConnectedComponentClass<WordOriginalOwnProps, *, *, *>
  = connect(mapStateToProps, mapDispatchToProps)(WordOriginal)

export default connected
