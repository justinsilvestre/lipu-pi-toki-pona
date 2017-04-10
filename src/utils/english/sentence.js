// @flow
import predicatePhrase, { realizePredicatePhrase } from './predicatePhrase'
import { lookUpEnglish, findByPartsOfSpeech } from '../dictionary'
import subjectPhrase, { realizeSubjectPhrase } from './subjectPhrase'
import vocativePhrase, { realizeVocativePhrase } from './vocativePhrase'
import type { WordsObject } from '../parseTokiPona'
import type { Sentence, SentenceContext } from '../grammar'
import type { SentenceTranslation } from './grammar'
import punctuate from './punctuate'
import type { WordTranslation } from '../dictionary'
import subordinateClause, { realizeSubordinateClause } from './subordinateClause'
import adverbPhrase, { realizeAdverbPhrase } from './adverbPhrase'
import prepositionalPhrase, { realizePrepositionalPhrase } from './prepositionalPhrase'

export default async function sentence(words: WordsObject, tokiPonaSentence: Sentence) : Promise<SentenceTranslation> {
    const { predicates, mood, subjects = [], vocative, contexts = [], seme = [], words: sentenceWords } = tokiPonaSentence
    const vocativeTranslation = await (vocative ? vocativePhrase(words, vocative) : Promise.resolve(null))
    const subjectTranslations = await subjectPhrase(words, subjects)
    const predicateTranslations = await predicatePhrase(words, predicates, subjects, subjectTranslations)
    const subordinateClauses = await Promise.all(contexts.filter(c => c.subjects).map(c => subordinateClause(words, c.subjects, c.predicates)))
    const { adverbPhrases, prepositionalPhrases } = await sentenceModifiers(words, contexts)

    return {
      ...(vocativeTranslation && { vocative: vocativeTranslation }),
      adverbPhrases,
      prepositionalPhrases,
      subordinateClauses,
      subjectPhrase: subjectTranslations,
      predicatePhrase: predicateTranslations,
      endPunctuation: words[sentenceWords[sentenceWords.length - 1]].after || '',
    }
}

async function sentenceModifiers(words: WordsObject, contexts: Array<SentenceContext>) : Promise<Object> {
  const { adverbPhrases = [], prepositionalPhrases = [] } = contexts.reduceRight((obj, c) => {
    if (c.subjects) {
      obj.subordinateClauses = (obj.subordinateClauses || []).concat(subordinateClause(words, c.subjects, c.predicates))
      return obj
    }

    const predicateId = c.predicates[0] // should only be one--otherwise, throw error?
    const predicate = words[predicateId]

    if (predicate.pos === 'prep') {
      obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(words, predicateId))
      return obj
    }

    const englishOptions = lookUpEnglish(predicate)
    const english = findByPartsOfSpeech(['adv', 'n'], englishOptions)
    if (english.pos === 'adv') {
      obj.adverbPhrases = (obj.adverbPhrases || []).concat(adverbPhrase(words, predicateId))
    } else if (english.pos === 'n' || english.pos.startsWith('pn')) {
      obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(words, predicateId, {
        head: { text: 'by', pos: 'prep' },
        objectIds: [predicateId],
      }))
    } // else throw error?

    return obj

  }, {})
  return {
    adverbPhrases: await Promise.all(adverbPhrases),
    prepositionalPhrases: await Promise.all(prepositionalPhrases),
  }
}

export const realizeSentence = (sentence: SentenceTranslation) : Array<WordTranslation> => {
  const { vocative, adverbPhrases = [], prepositionalPhrases = [], subordinateClauses = [], subjectPhrase, predicatePhrase, endPunctuation } = sentence
  return punctuate({ after: endPunctuation }, [
    ...(vocative ? realizeVocativePhrase(vocative) : []),
    ...adverbPhrases.map(realizeAdverbPhrase).reduce((a, b) => a.concat(b), []),
    ...prepositionalPhrases.map(realizePrepositionalPhrase).reduce((a, b) => a.concat(b), []),
    ...subordinateClauses.map((sc, i) =>
      i > 0
        ? [{ text: 'and', pos: 'conj' }, ...realizeSubordinateClause(sc)]
        : realizeSubordinateClause(sc)
      ).reduce((a, b) => a.concat(b), []),
    ...realizeSubjectPhrase(subjectPhrase),
    ...realizePredicatePhrase(predicatePhrase, subjectPhrase),
  ])
}
