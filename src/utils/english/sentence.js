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

export default function sentence(words: WordsObject, tokiPonaSentence: Sentence) : SentenceTranslation {
    const { predicates, mood, subjects = [], vocative, contexts = [], seme = [], words: sentenceWords } = tokiPonaSentence
    const vocativeTranslation = vocative ? vocativePhrase(words, vocative) : null
    const subjectTranslations = subjectPhrase(words, subjects)
    const predicateTranslations = predicatePhrase(words, predicates, subjects, subjectTranslations)
    const subordinateClauses = contexts.filter(c => c.subjects).map(c => subordinateClause(words, c.subjects, c.predicates))
    const adverbPhrases = contexts.filter(c => !c.subjects && words[c.predicates[0]].pos !== 'prep').map(c => adverbPhrase(words, c.predicates[0]))
    const prepositionalPhrases = contexts.filter(c => !c.subjects && words[c.predicates[0]].pos === 'prep').map(c => prepositionalPhrase(words, c.predicates[0]))
    console.log('adv', adverbPhrases)

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

function sentenceModifiers(words: WordsObject, contexts: Array<SentenceContext>) : Object {
  return contexts.reduceRight((obj, c) => {
    if (c.subjects) {
      obj.subordinateClauses = (obj.subordinateClauses || []).concat(subordinateClause(words, c.subjects, c.predicates))
    }

    const predicate = c.predicates[0] // should only be one--otherwise, throw error?

    if (predicate.pos === 'prep') {
      obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(words, predicate))
    }

    const englishOptions = lookUpEnglish(predicate)
    const english = findByPartsOfSpeech(['adv', 'n'], englishOptions)

    return obj

    // console.log('COMPLEMENT???', complement)
    // const englishOptions = lookUpEnglish(complement)
    // const possiblePartsOfSpeech = (Object.keys(englishOptions) : any)
    // const english = findByPartsOfSpeech(['adv', 'prep'], englishOptions)
    // console.log(english)
    // switch (english.pos) {
    //   case 'adv':
    //     obj.adverbPhrases = (obj.adverbPhrases || []).concat(adverbPhrase(words, c))
    //     // adverb modifiers
    //     break
    //   case 'prep':
    //     if (typeof complement.prepositionalObject !== 'string') throw new Error('complement needs prepositional object')
    //     obj.prepositionalPhrases = (obj.prepositionalPhrases || [])
    //       // .concat(prepositionalPhrase(words, english, [complement.prepositionalObject]))
    //       .concat(prepositionalPhrase(words, c, {
    //         preposition: english,
    //         objectIds: [complement.prepositionalObject],
    //       }))
    //     break
    //   case 'n':
    //     obj.prepositionalPhrases = (obj.prepositionalPhrases || [])
    //       .concat(prepositionalPhrase(words, c, {
    //         preposition: { text: 'by', pos: 'conj' },
    //         objectIds: [c],
    //       }))
    //     break
    //   case 'prop':
    //     //
    //     break
    //   // case ''
    //   default:
    //   //   throw new Error(`No viable noun translation for ${words[c].text} (${words[c].pos})`)
    // }
    // return obj
  }, {})
}

export const realizeSentence = (sentence: SentenceTranslation) : Array<WordTranslation> => {
  const { vocative, adverbPhrases = [], prepositionalPhrases, subordinateClauses = [], subjectPhrase, predicatePhrase, endPunctuation } = sentence
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
