import React from 'react'
import cn from 'classnames'
import { getText } from '../grammar'
import './SentenceOriginal.css'

const oneSpace = <div style={{ whiteSpace: 'pre' }}>{' '}</div>
const space = (spaced, word, i) => [
  ...spaced,
  ...(i === 0 ? [] : [oneSpace]),
  word,
]

const WordOriginal = ({ original, highlighted, ...events }) =>
  <div className={cn({ highlighted })} {...events}>
    <div>{getText(original)}</div>
    <div className={'annotation'}>{original.role}</div>
  </div>

const SentenceOriginal = ({ sentenceData, commonWordProps }) =>
  <div className={cn('sentence')}>
    {sentenceData.map((original, i) =>
      <WordOriginal original={original} key={i} {...commonWordProps(i)}>
        {getText(original)}
      </WordOriginal>
    ).reduce(space, [])}
  </div>

export default SentenceOriginal
