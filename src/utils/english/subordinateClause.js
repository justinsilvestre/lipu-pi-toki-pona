// @flow
import predicatePhrase, { realizePredicatePhrase } from './predicatePhrase'
import subjectPhrase, { realizeSubjectPhrase } from './subjectPhrase'
import type { WordsObject } from '../parseTokiPona'
import type { SubordinateClause } from './grammar'
import type { WordId } from '../grammar'
import punctuate from './punctuate'
import type { WordTranslation } from '../dictionary'
import type { Lookup } from '../../actions/lookup'

export default async function subordinateClause(lookup: Lookup, subjects: Array<WordId> = [], predicates: Array<WordId> = []) : Promise<SubordinateClause> {
  const { words } = lookup
  const subjectTranslations = await subjectPhrase(lookup, subjects)
  const predicateTranslations = await predicatePhrase(lookup, predicates, subjects, subjectTranslations)

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
