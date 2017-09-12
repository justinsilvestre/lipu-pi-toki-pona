
import expect from 'expect'
import processSentences from './parseTokiPona'
import type { TpWordsState, WordId } from '../../selectors/tpWords'
import { children, isComplementOf, isDescendantOf } from './words'

type ParseSentence = (text: string) => {
  words: TpWordsState,
  sentenceWords: Array<WordId>,
}
const parseSentence : ParseSentence = (text) => {
  const { sentences, words } = processSentences(text)

  return {
    words,
    sentenceWords: sentences[0].words,
  }
}

describe('children()', () => {
  it('retrieves complements', () => {
    const { sentenceWords, words } = parseSentence('toki pona lili')
    const [toki, pona, lili] = sentenceWords

    expect(children(words, toki)).toEqual([pona, lili])
  })
})

// describe('isComplementOf', () => {
//   it('returns true for a complement', () => {
//     const { sentenceWords, words } = parseSentence('toki pona')
//     const [toki, pona] = sentenceWords
//
//     expect(isComplementOf(words, toki, pona)).toBe(true)
//   })
// })
//
// describe('isDescendantOf', () => {
//   it('returns true for a complement of substantive', () => {
//     const { sentenceWords, words } = parseSentence('toki pona')
//     const [toki, pona] = sentenceWords
//
//     expect(isDescendantOf(words, toki, pona)).toBe(true)
//   })
//
//   it('returns true for complement of complement', () => {
//     const { sentenceWords, words } = parseSentence('toki pi pona mute')
//     const [toki, , , mute] = sentenceWords
//
//     expect(isDescendantOf(words, toki, mute)).toBe(true)
//   })
//
//   it('returns true for object of preposition', () => {
//     const { sentenceWords, words } = parseSentence('mi pona tawa sina')
//     const [, , tawa, sina] = sentenceWords
//
//     expect(isDescendantOf(words, tawa, sina)).toBe(true)
//   })
//
//   it('returns true for an infinitive of a preverb', () => {
//     const { sentenceWords, words } = parseSentence('mi wile pana e sona')
//     const [, wile, pana, , ] = sentenceWords
//     const parent = wile
//     const child = pana
//
//     expect(isDescendantOf(words, parent, child)).toBe(true)
//   })
//
//   it('returns true for subject of predicate', () => {
//     const { sentenceWords, words } = parseSentence('sina mute li pona')
//     const [sina, , , pona] = sentenceWords
//
//     expect(isDescendantOf(words, pona, sina)).toBe(true)
//   })
//
//   it('returns true for context predicate of predicate', () => {
//     const { sentenceWords, words } = parseSentence('ken la o kama')
//     const [ken, , , kama] = sentenceWords
//
//     expect(isDescendantOf(words, kama, ken)).toBe(true)
//   })
//
//   it('returns true for subject of context predicate', () => {
//     const { sentenceWords, words } = parseSentence('sina wile la mi kama')
//     const [subject, contextPredicate] = sentenceWords
//
//     expect(isDescendantOf(words, contextPredicate, subject)).toBe(true)
//   })
// })
