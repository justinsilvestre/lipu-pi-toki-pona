// @flow
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import nounPhrase, { realizeNounPhrase } from './nounPhrase'
import { ANIMATE_NOUNS, INANIMATE_NOUNS, ANIMATE_SUBJECT_VERBS } from '../tokiPonaSemanticGroups.js'
import type { SubjectPhrase } from './grammar'
import { getPrimary } from '../dictionary'
import RiTa, { SINGULAR, PLURAL, FIRST_PERSON, THIRD_PERSON } from '../rita'
import type { WordsObject } from '../parseTokiPona'
import type { WordId } from '../grammar'

export default function subjectPhrase(words: WordsObject, headIds: Array<WordId>) : SubjectPhrase {
  if (!headIds.length) return {
    // nounPhrases: [{ head: { text: 'it', pos: 'pns' } }],
    nounPhrases: [],
    isPlural: true,
    isFirstPerson: false,
  }

  const nounPhrases = headIds.map((s, i) => {
    console.log(words[s].text, lookUpEnglish(words[s]))
    // TODO: anu phrases
    // return (i > 0 ? [{ text: 'and', pos: 'conj' }] : []).concat(nounPhrase(words, s))
    return nounPhrase(words, s)
  })
  // console.log('SUBJECT!', nounPhrases[0] && nounPhrases[0].head, nounPhrases.some(np => ['I', 'we', 'me'].includes(np.head.text)))

  const result = {
    nounPhrases,
    isPlural: nounPhrases.length > 1 || (nounPhrases[0] && nounPhrases[0].head.number === PLURAL || nounPhrases[0].head.text === 'you'),
    isFirstPerson: nounPhrases.some(np => ['I', 'we', 'me'].includes(np.head.text)),
    animacy: undefined,
  }

  headIds.forEach(s => {
    const text = getPrimary(words[s].text)
    if (result.animacy !== 'INANIMATE' && (INANIMATE_NOUNS.includes(text) || ANIMATE_SUBJECT_VERBS.includes(text))) {
      result.animacy = 'INANIMATE'
    } else if (!result.animacy && ANIMATE_NOUNS.includes(text)) {
      result.animacy = 'ANIMATE'
    }
  })

  return result
}

export function realizeSubjectPhrase(subjectPhrase: SubjectPhrase) {
  return subjectPhrase.nounPhrases.reduce((realized, nounPhrase, i) => {
    return realized.concat(i > 0 ? [{ text: 'and', pos: 'conj' }, ...realizeNounPhrase(nounPhrase)] : realizeNounPhrase(nounPhrase))
  }, [])
}
