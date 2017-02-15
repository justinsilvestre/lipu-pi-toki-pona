// @flow
import type { Sentence, EnglishPartOfSpeech } from './grammar'
import type { WordsObject } from './parseTokiPona'
import { map, flatten, intersperse, last } from 'ramda'
import RiTa, { SINGULAR, PLURAL, FIRST_PERSON, THIRD_PERSON } from './rita'
import nounPhrase, { realizeNounPhrase } from './english/nounPhrase'
import { realizeVerbPhrase } from './english/verbPhrase'
import predicatePhrase, { realizePredicatePhrase } from './english/predicatePhrase'
import subjectPhrase, { realizeSubjectPhrase } from './english/subjectPhrase'

export type WordTranslation = {
  text: string,
  pos: EnglishPartOfSpeech,
}
export type SentenceTranslation = Array<WordTranslation>

export type EnglishDictionaryEntry = { [englishPartOfSpeech: EnglishPartOfSpeech]: Array<WordTranslation> }

export default function translate(sentences: Array<Sentence>, words: WordsObject) : Array<SentenceTranslation> {
  return sentences.map(({ words: sentenceWords, predicates, mood, subjects = [], vocative, contexts = {}, seme = [] }) => {

    const vocativeTranslation = vocative ? realizeNounPhrase(nounPhrase(words, vocative)) : []
    const subjectTranslations = subjectPhrase(words, subjects)
    const subjectWords1 = realizeSubjectPhrase(subjectTranslations)

    const predicateTranslations = predicatePhrase(words, predicates, subjects, subjectTranslations)
    // const predicateWords = predicateTranslations.phrases.map(realizeVerbPhrase).reduce((a, b) => a.concat(b), [])
    const predicateWords = realizePredicatePhrase(predicateTranslations, subjectTranslations).reduce((a, b) => a.concat(b), [])
    // const predicateTranslations = predicates.map(p => {
    //   return predicatePhrase(words, p, subjectIds, englishSubjectNumber)
    //   return nounPhrase(words, p).words
    // })
    // const mainClauseTranslation = [...subjectWords]
    const mainClauseTranslation = [
      ...vocativeTranslation,
      ...subjectWords1,
      ...predicateWords
    ]

    return [
      ...mainClauseTranslation,
    ]
  })
}
