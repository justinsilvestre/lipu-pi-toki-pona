// @flow
import predicatePhrase, { realizePredicatePhrase } from './predicatePhrase'
import subjectPhrase, { realizeSubjectPhrase } from './subjectPhrase'
import type { WordsObject } from '../parseTokiPona'
import type { SubordinateClause } from './grammar'
import punctuate from './punctuate'
import type { WordTranslation } from '../dictionary'

export default function subordinateClause(words: WordsObject, subjects = [], predicates = []) : SubordinateClause {
  // if no subject, consider:
      // adverb - ken la?
      // prepositional phrases as adverb modifying main verb?

    const subjectTranslations = subjectPhrase(words, subjects)
    const predicateTranslations = predicatePhrase(words, predicates, subjects, subjectTranslations)

    return {
      conjunction: { text: 'when', pos: 'conj' },
      subjectPhrase: subjectTranslations,
      predicatePhrase: predicateTranslations,
      endPunctuation: words[predicates[predicates.length - 1]].after || '',
    }
}

export const realizeSubordinateClause = (sentence: SubordinateClause) : Array<WordTranslation> => {
  const { conjunction, subjectPhrase, predicatePhrase, endPunctuation } = sentence
  return punctuate({ after: endPunctuation }, [
    conjunction,
    ...realizeSubjectPhrase(subjectPhrase),
    ...realizePredicatePhrase(predicatePhrase, subjectPhrase),
  ])
}
