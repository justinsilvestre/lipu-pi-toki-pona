// @flow
import React from 'react'
import { connect } from 'react-redux'
import type { AppState } from '../redux'
import type { SentenceTranslation as SentenceTranslationType } from '../utils/english/grammar'
import { realizeSentence } from '../utils/english/sentence'
import EnWord from './EnWord'
import { getEnWordText } from '../selectors/enWords'
// import getTranslation

type OwnProps = {
  sentenceData: SentenceTranslationType
}
type StateProps = {
}
type Props = OwnProps & StateProps

const capitalize = (string) => `${string.charAt(0).toUpperCase()}${string.slice(1)}`


const SentenceTranslation = ({ sentenceData }: Props) =>
  sentenceData && sentenceData.words ? <div className="sentenceTranslation">
    {sentenceData.words.map((id, i) =>
      <EnWord key={id + i} id={id} isFirst={i === 0} />
    )}
  </div> : null

const mapStateToProps = (appState: AppState) : StateProps => ({
  // selected: isWordSelected...
})

export default connect(mapStateToProps)(SentenceTranslation)
