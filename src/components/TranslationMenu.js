// @flow
import React from 'react'
import { connect } from 'react-redux'
import type { AppState } from '../redux'
import type { SentenceTranslation as SentenceTranslationType } from '../utils/english/grammar'
import { realizeSentence } from '../utils/english/sentence'
import type { WordTranslation } from '../utils/dictionary'
import { wasSelectionMade } from '../reducers'

type OwnProps = {
  translation: WordTranslation,
}
type StateProps = {
  selectionWasMade: boolean,
}
type Props = OwnProps & StateProps

const TranslationMenu = ({ selectionWasMade, translation }: Props) => selectionWasMade ?
  <div className="translationMenu">
    <ul className="translationMenuLemmaOptions">
      <li>come</li>
      <li>become</li>
    </ul>
    <ul className="translationMenuPartsOfSpeech">
      <li>prev</li><li>prep</li><li>n/mod</li>
    </ul>
  </div> : null

const mapStateToProps = (state: AppState) : StateProps => ({
  selectionWasMade: wasSelectionMade(state),
})

export default connect(mapStateToProps)(TranslationMenu)
