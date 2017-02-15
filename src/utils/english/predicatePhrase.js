// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import { ANIMATE_NOUNS } from '../tokiPonaSemanticGroups.js'
import nounPhrase from './nounPhrase'
import verbPhrase, { copulaPhrase, realizeVerbPhrase } from './verbPhrase'

const complementPartsOfSpeech = ['adj', 'n', 'pn', 'pnp', 'pnin', 'pnio', 'pnpn', 'pnpo', 'pns', 'pnsn', 'pnso', 'pno']

export default function predicatePhrase(words, headIds, tokiPonaSubjectIds, englishSubjectPhrase) {
  // if subj is animate and pred is animate-subj-verb, translate predicate head to verb.
  // if subj is inanimate and pred is animate-subj-verb, translate predicate head to noun, use copula.
  console.log('subject for predicate', englishSubjectPhrase)
  const getPhrase = englishSubjectPhrase.animacy === 'INANIMATE' ? (w, p, t) => copulaPhrase(w, p, t) : verbPhrase
  const phrases = headIds.map(p => {
    console.log(words[p].text, lookUpEnglish(words[p]))
    const t = findByPartsOfSpeech(complementPartsOfSpeech, lookUpEnglish(words[p]))
    return getPhrase(words, p, t)
  })

  return { phrases }
}

export function realizePredicatePhrase(phraseData, englishSubjectPhrase) {
  return phraseData.phrases.map(p => realizeVerbPhrase(p, englishSubjectPhrase)).reduce((a, b) => a.concat(b))
}
