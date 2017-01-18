// @flow
import React from 'react'
import cn from 'classnames'
import { connect } from 'react-redux'
import type { ConnectedComponentClass } from 'react-redux'
import type { Sentence, Word } from '../utils/grammar'
import {
  wordMouseEnter, wordMouseLeave, wordMouseDown, wordMouseUp,
} from '../redux/actions'
import type { AppState } from '../redux'
import './SentenceOriginal.css'
import WordOriginal from './WordOriginal'

type SentenceOriginalOwnProps = {
  sentenceData: Sentence,
  index: number,
}
type SentenceOriginalStateProps = {
  pendingSelectionStart: ?Word,
  pendingSelectionEnd: ?Word,
  selectionStart: ?Word,
  selectionEnd: ?Word,
  highlightedWord: ?Word,
}
type SentenceOriginalProps = SentenceOriginalOwnProps & SentenceOriginalStateProps
const SentenceOriginal = ({ sentenceData, index: sentenceIndex, highlightedWord } : SentenceOriginalProps) =>
  <div className={cn('sentence')}>
    {sentenceData.words.map((originalId, i) =>
      <WordOriginal
        originalId={originalId}
        key={i}
      />
    )}
  </div>

const mapStateToProps = (state : AppState) : SentenceOriginalStateProps => {
  const {
    pendingSelectionStart,
    pendingSelectionEnd,
    highlightedWord,
    selectionStart,
    selectionEnd,
  } = state
  return {
    pendingSelectionStart,
    pendingSelectionEnd,
    highlightedWord,
    selectionStart,
    selectionEnd,
  }
}
const mapDispatchToProps = {
  onMouseEnter: wordMouseEnter,
  onMouseLeave: wordMouseLeave,
  onMouseDown: wordMouseDown,
  onMouseUp: wordMouseUp,
}

const connected : ConnectedComponentClass<SentenceOriginalOwnProps, *, *, *> = connect(mapStateToProps, mapDispatchToProps)(SentenceOriginal)
export default connected