// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import SentenceOriginal from './SentenceOriginal'
import SentenceTranslation from './SentenceTranslation'
import type { Sentence } from '../selectors/tpSentences'
import type { SentenceTranslation as SentenceTranslationType } from '../utils/english/grammar'
import { getEnSentence } from '../selectors'

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
      <div className="sentenceContainer">
        <SentenceOriginal sentenceData={tp} index={sentenceIndex} />
        {en && <SentenceTranslation sentenceData={en} />}
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
