// @flow
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import type { AppState } from '../redux'
import type { SentenceTranslation as SentenceTranslationType } from '../utils/english/grammar'
import { realizeSentence } from '../utils/english/sentence'
import type { WordTranslation } from '../utils/dictionary'
import { wasSelectionMade, getSelection, lookUpTranslations, getEnLemmaText } from '../reducers'
import { changeWordTranslation } from '../actions/lookup'
import type { PhraseTranslation, PhraseTranslationId } from '../reducers/phraseTranslations'

type OwnProps = {
  selectedWordId: string,
  phraseTranslation: PhraseTranslation,
  changeWordTranslation: Function,
}
type StateProps = {
  id: PhraseTranslationId,
  text: string,
}
type Props = OwnProps & StateProps

class TranslationMenuOption extends PureComponent {
  props: Props

  render() {
    const { text, id, changeWordTranslation, selectedWordId } = this.props

    return <li onClick={() => changeWordTranslation(selectedWordId, id)}>{text}</li>
  }
}
const mapStateToProps = (state: AppState, { phraseTranslation }: OwnProps): StateProps => {
  const { id } = phraseTranslation
  return {
    id,
    text: getEnLemmaText(state, id),
  }
}

export default connect(mapStateToProps)(TranslationMenuOption)
