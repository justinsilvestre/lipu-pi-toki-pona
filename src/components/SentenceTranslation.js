// @flow
import React from 'react'
import { connect } from 'react-redux'
import type { AppState } from '../redux'
import type { Sentence } from '../utils/grammar'

type SentenceTranslationOwnProps = {
  sentenceData: Sentence
}
type SentenceTranslationStateProps = {
  enSentences: Array<Array<{ text: string, pos: string }>>
}
type SentenceTranslationProps = SentenceTranslationOwnProps & SentenceTranslationStateProps

const SentenceTranslation = ({ sentenceData, enSentences } : SentenceTranslationProps) =>
  <div>
    {enSentences[sentenceData.index].map(({ text }) => text).join(' ')}
  </div>

const mapStateToProps = ({ enSentences }: AppState) : SentenceTranslationStateProps => ({
  enSentences,
})

export default connect(mapStateToProps)(SentenceTranslation)
