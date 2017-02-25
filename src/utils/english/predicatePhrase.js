// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import verbPhrase, { copulaPhrase, realizeVerbPhrase } from './verbPhrase'
import type { WordsObject } from '../parseTokiPona'
import type { WordId } from '../grammar'
import type { SubjectPhrase, VerbPhrase, PredicatePhrase } from './grammar'

const complementPartsOfSpeech = ['adj', 'n', 'pn', 'pnp', 'pnin', 'pnio', 'pnpn', 'pnpo', 'pns', 'pnsn', 'pnso', 'pno']

// should be able to shorten this function signature
export default function predicatePhrase(
  words: WordsObject,
  headIds: Array<WordId>,
  tokiPonaSubjectIds: Array<WordId>,
  englishSubjectPhrase: SubjectPhrase
) : PredicatePhrase {
  // if subj is animate and pred is animate-subj-verb, translate predicate head to verb.
  // if subj is inanimate and pred is animate-subj-verb, translate predicate head to noun, use copula.
  console.log('subject for predicate', englishSubjectPhrase)
  // const getPhrase = englishSubjectPhrase.animacy === 'INANIMATE' ? (w, p, t) => copulaPhrase(w, p, t) : verbPhrase
  const phrases = headIds.map(p => {
    console.log(words[p].text, lookUpEnglish(words[p]))
    const t = findByPartsOfSpeech(complementPartsOfSpeech, lookUpEnglish(words[p]))
    // return verbPhrase(words, p, t)
    return verbPhrase(words, p, englishSubjectPhrase)
  })

  return { phrases }
}

export function realizePredicatePhrase(phraseData: PredicatePhrase, englishSubjectPhrase: SubjectPhrase) {
  return phraseData.phrases.map(p => realizeVerbPhrase(p, englishSubjectPhrase)).reduce((a, b, i) => {
    return a.concat(i > 0 ? [{ text:'and', pos: 'conj' }, ...b] : b)
  })
}
