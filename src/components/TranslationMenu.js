// @flow
import React from 'react'
import { connect } from 'react-redux'
import type { AppState } from '../redux'
import type { SentenceTranslation as SentenceTranslationType } from '../utils/english/grammar'
import { realizeSentence } from '../utils/english/sentence'
import type { WordTranslation } from '../utils/dictionary'
import { wasSelectionMade, getSelection, lookUpTranslations, getEnLemmaText } from '../reducers'
import { changeWordTranslation } from '../actions/lookup'

type OwnProps = {
  translation: WordTranslation,
}
type StateProps = {
  selectionWasMade: boolean,
  selectedWordId: string,
  englishTranslations: Array<PhraseTranslation>,
}
type DispatchProps = {
  changeWordTranslation: Function,
}
type Props = OwnProps & StateProps & DispatchProps
const TranslationMenu = ({ changeWordTranslation, selectedWordId, selectionWasMade, englishTranslations, text }: Props) => selectionWasMade ?
  <div className="translationMenu">
    <ul className="translationMenuLemmaOptions">
      {englishTranslations.map(t =>
        <li key={t.id} onClick={() => changeWordTranslation(selectedWordId, t.id)}>
          {t.text}
        </li>)}
    </ul>
  </div> : null

const mapStateToProps = (state: AppState) : StateProps => {
  const selectionWasMade = wasSelectionMade(state)
  if (!selectionWasMade) return { selectionWasMade }

  const word = getSelection(state)
  return {
    selectionWasMade,
    selectedWordId: word.id,
    text: word.text,
    englishTranslations: lookUpTranslations(state, word.lemmaId).map(t =>
      ({ text: getEnLemmaText(state, t.id), id: t.id })
    ),
  }
}

export default connect(mapStateToProps, { changeWordTranslation })(TranslationMenu)
