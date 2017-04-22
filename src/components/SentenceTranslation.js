// @flow
import React from 'react'
import { connect } from 'react-redux'
import type { AppState } from '../redux'
import type { SentenceTranslation as SentenceTranslationType } from '../utils/english/grammar'
import { realizeSentence } from '../utils/english/sentence'
import type { EnWord } from '../selectors/enWords'
// import getTranslation

type SentenceTranslationOwnProps = {
  sentenceData: SentenceTranslationType
}
type SentenceTranslationStateProps = {
}
type SentenceTranslationProps = SentenceTranslationOwnProps & SentenceTranslationStateProps

const capitalize = (string) => `${string.charAt(0).toUpperCase()}${string.slice(1)}`

const getText = (word: EnWord) : string => {
  const { before = '', after = '', text } = word
  return `${before}${text}${after}`
}

const SentenceTranslation = ({ sentenceData } : SentenceTranslationProps) =>
  sentenceData && <div className="sentenceTranslation">
    {realizeSentence(sentenceData).map((enWord, i) => {
      return i === 0 ? capitalize(getText(enWord)) : getText(enWord)
    }).join(' ')}
  </div>

const mapStateToProps = (appState: AppState) : SentenceTranslationStateProps => ({
  // selected: isWordSelected...
})

export default connect(mapStateToProps)(SentenceTranslation)
