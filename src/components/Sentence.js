// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import SentenceOriginal from './SentenceOriginal'
import SentenceTranslation from './SentenceTranslation'
import type { Sentence } from '../utils/grammar'

type SentenceProps = {
  tp: Sentence,
  index: number,
}
class SentencePair extends Component {
  props: SentenceProps

  render() {
    const {
      tp,
      index: sentenceIndex,
    } = this.props

    return (
      <div style={{ display: 'inline-block', textAlign: 'left' }}>
        <SentenceOriginal sentenceData={tp} index={sentenceIndex} />
        <SentenceTranslation sentenceData={tp} />
      </div>
    )
  }
}

const mapStateToProps = ({ highlightedSentenceIndex, highlightedWordIndex }) => ({ highlightedSentenceIndex, highlightedWordIndex })
const mapDispatchToProps = {
  // wordMouseEnter,
  // wordMouseDown,
  // wordMouseUp,
}

export default connect(mapStateToProps, mapDispatchToProps)(SentencePair)
