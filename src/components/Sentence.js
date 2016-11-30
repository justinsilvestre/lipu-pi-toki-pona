import React, { Component } from 'react'
import { head } from 'ramda'
import cn from 'classnames'
import { getKey } from '../grammar'
import dic from '../dictionary'
import maybe, { nothing } from '../maybe'
import { setHighlightIndexes } from '../reducers'
import { connect } from 'react-redux'
import SentenceOriginal from './SentenceOriginal'

const space = (spaced, word, i) => [
  ...spaced,
  ...(i === 0 ? [] : [' ']),
  word,
]

const getEnglish = (word) => {
  const englishData = maybe(dic[getKey(word)])
  const partOfSpeech = englishData.map(Object.keys, head)
  const getTranslationUnlessParticle = (pos) => pos !== 'p' ? englishData.map(pos) : nothing
  return partOfSpeech
    .then(getTranslationUnlessParticle)
    .map(head)
    .val('')
}

const WordTranslation = ({ translation, highlighted, ...events }) =>
  <span className={cn({ highlighted })} {...events}>
    {translation}
  </span>

const SentenceTranslation = ({ sentenceData, commonWordProps }) =>
  <div>
    {sentenceData.map((original, i) =>
      <WordTranslation
        key={i}
        translation={getEnglish(original)}
        {...commonWordProps(i)}
      />
    ).reduce(space, [])}
  </div>

class Sentence extends Component {
  render = () => {
    // everything i need from outside
    const {
      tp,
      highlightedWordIndex,
      highlightedSentenceIndex,
      setHighlightIndexes,
      index: sentenceIndex,
    } = this.props

    // prepare building blocks
    const commonWordProps = (i) => ({
      onMouseEnter: () => setHighlightIndexes(sentenceIndex, i),
      onMouseLeave: () => setHighlightIndexes(null, null),
      highlighted:  highlightedSentenceIndex === sentenceIndex
        && highlightedWordIndex === i,
    })

    // arrange and glue building blocks together
    return (
      <div style={{ display: 'inline-block', textAlign: 'left' }}>
        <SentenceOriginal sentenceData={tp} commonWordProps={commonWordProps} />
        <SentenceTranslation sentenceData={tp} commonWordProps={commonWordProps} />
      </div>
    )
  }
}

const mapStateToProps = ({ highlightedSentenceIndex, highlightedWordIndex }) => ({ highlightedSentenceIndex, highlightedWordIndex })
const mapDispatchToProps = {
  setHighlightIndexes,
}

export default connect(mapStateToProps, mapDispatchToProps)(Sentence)
