// @flow
import React from 'react'
import { connect } from 'react-redux'
import cn from 'classnames'
import type { AppState } from '../redux'
import type { WordId } from '../selectors/tpWords'
import { isWordHighlighted, getEnWordText, getEnWord, getPhraseTranslation } from '../selectors'

type OwnProps = {
  isFirst: boolean
}
type StateProps = {
  text: string,
  highlighted: boolean,
  tpWordId?: WordId,
}
type Props = OwnProps & StateProps

const capitalize = (string) => `${string.charAt(0).toUpperCase()}${string.slice(1)}`

const EnWord = ({ text, isFirst, highlighted } : Props) =>
  <span className={cn('enWord', { highlighted })}>
    {isFirst ? capitalize(text) : text}{' '}
  </span>

const mapStateToProps = (state: AppState, { id }) : StateProps => {
  const word = getEnWord(state, id)
  const text = word ? getEnWordText(state, id) : '...'
  if (word && word.phraseTranslationId) {
    // const phraseTranslation = getPhraseTranslation(state, word.phraseTranslationId)
    return {
      word,
      text,
      tpWordId: word.tpWordId,
      highlighted: isWordHighlighted(state, word.tpWordId),
    }
  } else {
    return {
      word,
      text,
      highlighted: false,
    }
  }
}

export default connect(mapStateToProps)(EnWord)
