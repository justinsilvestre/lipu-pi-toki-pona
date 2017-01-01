// @flow
import React from 'react'
import cn from 'classnames'
import { head } from 'ramda'
import maybe, { nothing } from '../utils/maybe'
import type { Sentence, Word } from '../utils/grammar'
import dic from '../utils/dictionary'

const space = (elements: Array<React$Element<any>>) : Array<React$Element<any>> => elements.reduce((spaced, word, i) => [
  ...spaced,
  i === 0 ? <span key={'space' + i}/> : <span key={'space' + i}> </span>,
  word,
], [])

const getEnglish = (word: Word) : { text: string } => {
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
        translation={getEnglish(original).text}
      />
    ))}
  </div>

export default SentenceTranslation
