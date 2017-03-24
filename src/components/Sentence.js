// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import SentenceOriginal from './SentenceOriginal'
import SentenceTranslation from './SentenceTranslation'
import type { Sentence } from '../utils/grammar'
import type { SentenceTranslation as SentenceTranslationType } from '../utils/english/grammar'
import { getEnSentence } from '../reducers'

type SentenceProps = {
  tp: Sentence,
  en: SentenceTranslationType,
  index: number,
}
class SentencePair extends Component {
  props: SentenceProps

  render() {
    const {
      tp,
      en,
      index: sentenceIndex,
    } = this.props

    return (
      <div style={{ display: 'inline-block', textAlign: 'left' }}>
        <SentenceOriginal sentenceData={tp} index={sentenceIndex} />
        <SentenceTranslation sentenceData={en} />
      </div>
    )
  }
}

const mapStateToProps = (state, { index }) => ({
  en: getEnSentence(state, index)
})
const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(SentencePair)
