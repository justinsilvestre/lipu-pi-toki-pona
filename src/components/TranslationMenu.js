// @flow
import React from 'react'
import { connect } from 'react-redux'
import type { AppState } from '../redux'
import type { SentenceTranslation as SentenceTranslationType } from '../utils/english/grammar'
import { realizeSentence } from '../utils/english/sentence'
import type { WordTranslation } from '../utils/dictionary'
import { wasSelectionMade, getSelection, lookUpTranslations, getEnLemmaText } from '../reducers'

type OwnProps = {
  translation: WordTranslation,
}
type StateProps = {
  selectionWasMade: boolean,
}
type Props = OwnProps & StateProps
selectedWord:
const TranslationMenu = ({ selectionWasMade, englishTranslations, text }: Props) => selectionWasMade ?
  <div className="translationMenu">
    <ul className="translationMenuLemmaOptions">
      {englishTranslations.map(t => <li>{t}</li>)}
    </ul>
    <ul className="translationMenuPartsOfSpeech">
      <li>prev</li><li>prep</li><li>n/mod</li>
    </ul>
  </div> : null

const mapStateToProps = (state: AppState) : StateProps => {
  const selectionWasMade = wasSelectionMade(state)
  if (!selectionWasMade) return { selectionWasMade }

  const word = getSelection(state)
  return {
    selectionWasMade,
    text: word.text,
    englishTranslations: lookUpTranslations(state, word.lemmaId).map(t => getEnLemmaText(state, t.id))
  }
}

export default connect(mapStateToProps)(TranslationMenu)
