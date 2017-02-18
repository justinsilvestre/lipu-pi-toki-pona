// @flow
import predicatePhrase, { realizePredicatePhrase } from './predicatePhrase'
import subjectPhrase, { realizeSubjectPhrase } from './subjectPhrase'
import vocativePhrase, { realizeVocativePhrase } from './vocativePhrase'
import type { WordsObject } from '../parseTokiPona'
import type { Sentence } from '../grammar'
import type { SentenceTranslation } from './grammar'
import punctuate from './punctuate'
import type { WordTranslation } from '../dictionary'

export default function sentence(words: WordsObject, tokiPonaSentence: Sentence) : SentenceTranslation {
    const { predicates, mood, subjects = [], vocative, contexts = {}, seme = [], words: sentenceWords } = tokiPonaSentence
    const vocativeTranslation = vocative ? vocativePhrase(words, vocative) : null
    const subjectTranslations = subjectPhrase(words, subjects)
    const predicateTranslations = predicatePhrase(words, predicates, subjects, subjectTranslations)

    return {
      ...(vocativeTranslation && { vocative: vocativeTranslation }),
      subjectPhrase: subjectTranslations,
      predicatePhrase: predicateTranslations,
      endPunctuation: words[sentenceWords[sentenceWords.length - 1]].after || '',
    }
}

export const realizeSentence = (sentence: SentenceTranslation) : Array<WordTranslation> => {
  const { vocative, subjectPhrase, predicatePhrase, endPunctuation } = sentence
  return punctuate({ after: endPunctuation }, [
    ...(vocative ? realizeVocativePhrase(vocative) : []),
    ...realizeSubjectPhrase(subjectPhrase),
    ...realizePredicatePhrase(predicatePhrase, subjectPhrase),
  ])
}
