// @flow
import { combineReducers } from 'redux'
import type { AppState } from '../selectors'

import mouse from './mouse'
import tpSentences from './tpSentences'
import tpWords from './tpWords'
import colors from './colors'
import enSentences from './enSentences'
import tpLemmas from './tpLemmas'
import enLemmas from './enLemmas'
import phraseTranslations from './phraseTranslations'
import documentTranslationPhrases from './documentTranslationPhrases'
import notifications from './notifications'


const reducer = combineReducers({
  mouse,
  tpSentences,
  tpWords,
  tpLemmas,
  colors,
  enSentences,
  enLemmas,
  phraseTranslations,
  documentTranslationPhrases,
  notifications,
})

export default reducer
