// @flow
import React from 'react'
import cn from 'classnames'
import type { Sentence } from '../selectors/tpSentences'
import './SentenceOriginal.css'
import WordOriginal from './WordOriginal'

type SentenceOriginalProps = {
  sentenceData: Sentence,
  index: number,
}
const SentenceOriginal = ({ sentenceData, index: sentenceIndex } : SentenceOriginalProps) =>
  <div className={cn('sentence')}>
    {sentenceData.words.map((originalId, i) =>
      <WordOriginal
        originalId={originalId}
        key={i}
      />
    )}
  </div>

export default SentenceOriginal
