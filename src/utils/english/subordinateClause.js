// @flow
import predicatePhrase, { realizePredicatePhrase } from './predicatePhrase'
import subjectPhrase, { realizeSubjectPhrase } from './subjectPhrase'
import type { WordsObject } from '../parseTokiPona'
import type { SubordinateClause } from './grammar'
import type { WordId } from '../grammar'
import punctuate from './punctuate'
import type { WordTranslation } from '../dictionary'

export default async function subordinateClause(words: WordsObject, subjects: Array<WordId> = [], predicates: Array<WordId> = []) : Promise<SubordinateClause> {
  const subjectTranslations = await subjectPhrase(words, subjects)
  const predicateTranslations = await predicatePhrase(words, predicates, subjects, subjectTranslations)

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
