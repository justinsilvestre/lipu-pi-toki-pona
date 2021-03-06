// @flow
import React, { Component } from 'react'
import cn from 'classnames'
import { connect } from 'react-redux'
import type { ConnectedComponentClass } from 'react-redux'
import type { Word, WordId } from '../selectors/tpWords'
import type { Color } from '../utils/getHighlighting'
import type { AppState } from '../selectors'
import { getWord, isWordHighlighted, isWordSelected, isWordInPendingSelection, getWordColor, getTpText } from '../selectors'
import {
  wordMouseEnter, wordMouseLeave, wordMouseDown, wordMouseUp, wordClick,
} from '../actions'
import TranslationMenu from './TranslationMenu'

const adjustColor = (selecting: bool, selected: bool, [h, s, l]: Color) : Color =>
  [h, s + (selected || selecting ? 1 : 0) * 60, l + (selecting ? 1 : 0) * 20]

type WordOriginalOwnProps = {
  originalId: WordId,
}
type WordOriginalStateProps = {
  color: Color,
  original: Word,
  selecting: boolean,
  selected: boolean,
  highlighted: boolean,
  text: string,
}
type WordOriginalDispatchProps = {
  onMouseUp: Function, onMouseDown: Function, onMouseEnter: Function, onMouseLeave: Function, onClick: Function,
}
type WordOriginalProps = WordOriginalOwnProps & WordOriginalStateProps & WordOriginalDispatchProps

class WordOriginal extends Component {
  props : WordOriginalProps

  onMouseEnter = () => this.props.onMouseEnter(this.props.originalId)
  onMouseLeave = () => this.props.onMouseLeave(this.props.originalId)
  onClick = () => this.props.onClick(this.props.originalId)
  onMouseUp = () => this.props.onMouseUp(this.props.originalId)
  onMouseDown = (e) => {
    this.props.onMouseDown(this.props.originalId)
    e.preventDefault()
  }


  render() {
    const { original, color, selecting, selected, highlighted, text } = this.props
    const [h, s, l] = adjustColor(selecting, selected, color)
    const l2 = l + (!selecting && !selected && highlighted ? 20 : 0)
    const style = { color: `hsl(${h}, ${s}%, ${l2}%)`, fontWeight: original.role.endsWith('PARTICLE') ? 300 : 'normal' }

    const { onMouseEnter, onMouseLeave, onClick, onMouseUp, onMouseDown } = this

    return (
      <span className="wordContainer" {...{ onMouseEnter, onMouseLeave, onClick, onMouseUp, onMouseDown }}>
        <span className={cn('word', { selecting, selected })}  style={style}>
          {text}{' '}
        </span>
        {selected && <TranslationMenu />}
      </span>
    )
  }
}

const mapStateToProps = (state: AppState, { originalId }: WordOriginalOwnProps) : WordOriginalStateProps => ({
  highlighted: isWordHighlighted(state, originalId),
  color: getWordColor(state, originalId),
  original: getWord(state, originalId),
  selecting: isWordInPendingSelection(state, originalId),
  selected: isWordSelected(state, originalId),
  text: originalId && getTpText(state, originalId),
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
