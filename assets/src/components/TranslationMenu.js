// @flow
import React from 'react'
import { connect } from 'react-redux'
import type { AppState } from '../redux'
import type { SentenceTranslation as SentenceTranslationType } from '../utils/english/grammar'
import { realizeSentence } from '../utils/english/sentence'
import { wasSelectionMade, getSelection, lookUpTranslations, getEnLemmaText } from '../selectors'
import { changeWordTranslation } from '../actions/lookup'
import type { PhraseTranslation } from '../selectors/phraseTranslations'
import TranslationMenuOption from './TranslationMenuOption'

type OwnProps = {
  translation: PhraseTranslation,
}
type StateProps = {
  selectedWordId: string,
  englishTranslations: Array<PhraseTranslation>,
}
type DispatchProps = {
  changeWordTranslation: Function,
}
type Props = OwnProps & StateProps & DispatchProps

const TranslationMenu = ({ changeWordTranslation, selectedWordId, selectionWasMade, englishTranslations, text }: Props) =>
 <div className="translationMenu">
  <ul className="translationMenuLemmaOptions">
    {englishTranslations.map(t =>
      <TranslationMenuOption key={t.id} phraseTranslation={t} changeWordTranslation={changeWordTranslation} selectedWordId={selectedWordId} />
    )}
  </ul>
</div>

const mapStateToProps = (state: AppState) : StateProps => {
  const word = getSelection(state)
  if (!word) throw new Error('quiet flow')
  return {
    selectedWordId: word.id,
    text: word.text,
    englishTranslations: lookUpTranslations(state, word.lemmaId),
  }
}

export default connect(mapStateToProps, { changeWordTranslation })(TranslationMenu)
