// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import verbPhrase, { copulaPhrase, realizeVerbPhrase } from './verbPhrase'
import type { WordsObject } from '../parseTokiPona'
import type { WordId } from '../grammar'
import type { SubjectPhrase, VerbPhrase, PredicatePhrase } from './grammar'
import type { Lookup } from '../../actions/lookup'

const complementPartsOfSpeech = ['adj', 'n', 'pn', 'pnp', 'pnin', 'pnio', 'pnpn', 'pnpo', 'pns', 'pnsn', 'pnso', 'pno']

// should be able to shorten this function signature
export default async function predicatePhrase(
  lookup: Lookup,
  headIds: Array<WordId>,
  tokiPonaSubjectIds: Array<WordId>,
  englishSubjectPhrase: SubjectPhrase
) : Promise<PredicatePhrase> {
  const { words } = lookup
  // if subj is animate and pred is animate-subj-verb, translate predicate head to verb.
  // if subj is inanimate and pred is animate-subj-verb, translate predicate head to noun, use copula.

  // const getPhrase = englishSubjectPhrase.animacy === 'INANIMATE' ? (w, p, t) => copulaPhrase(w, p, t) : verbPhrase
  const phrases = await Promise.all(headIds.map(p => {
    const t = findByPartsOfSpeech(complementPartsOfSpeech, lookUpEnglish(words[p]))
    // return verbPhrase(lookup, p, t)
    return verbPhrase(lookup, p, { subjectPhrase: englishSubjectPhrase })
  }))

  return { phrases }
}

export function realizePredicatePhrase(phraseData: PredicatePhrase, englishSubjectPhrase: SubjectPhrase) {
  return phraseData.phrases.map(p => realizeVerbPhrase(p, englishSubjectPhrase)).reduce((a, b, i) => {
    return a.concat(i > 0 ? [{ text:'and', pos: 'conj' }, ...b] : b)
  })
}
