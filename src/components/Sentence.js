// @flow
import React, { Component } from 'react'
import { head } from 'ramda'
import cn from 'classnames'
import dic from '../utils/dictionary'
import maybe, { nothing } from '../utils/maybe'
import { connect } from 'react-redux'
import SentenceOriginal from './SentenceOriginal'
import type { Sentence, Word } from '../utils/grammar'

const space = (elements: Array<React$Element<any>>) : Array<React$Element<any>> => elements.reduce((spaced, word, i) => [
  ...spaced,
  i === 0 ? <span key={'space' + i}/> : <span key={'space' + i}> </span>,
  word,
], [])

const getEnglish = (word: Word) : string => {
  const englishData = maybe(dic[word.text])
  const partOfSpeech = englishData.map(Object.keys, head)
  const getTranslationUnlessParticle = (pos) => pos !== 'p' ? englishData.map(pos) : nothing
  return partOfSpeech
    .then(getTranslationUnlessParticle)
    .map(head)
    .val('')
}

type WordTranslationProps = {
  translation: string,
}
const WordTranslation = ({ translation }: WordTranslationProps) =>
  <span className={cn()}>
    {translation}
  </span>

type SentenceTranslationProps = {
  sentenceData: Sentence,
}
const SentenceTranslation = ({ sentenceData } : SentenceTranslationProps) =>
  <div>
    {space(sentenceData.words.map((original, i) =>
      <WordTranslation
        key={i}
        translation={getEnglish(original)}
      />
    ))}
  </div>

type SentenceProps = {
  tp: Sentence,
  index: number,
}
class SentencePair extends Component {
  props: SentenceProps

  render = () => {
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
