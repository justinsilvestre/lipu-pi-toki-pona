// @flow
import expect from 'expect'
import { pipe, head } from 'ramda'
import { children, isComplementOf, isDescendantOf, parseAndAddIndexes } from './grammar'
import type { Sentence } from './grammar'

const parseSentence : (text: string) => Sentence = pipe(parseAndAddIndexes, head)[0]

describe('children()', () => {
  it('retrieves complements', () => {
    const sentence : Sentence = parseSentence('toki pona lili')
    const [toki, pona, lili] = sentence.words

    expect(children(sentence, toki)).toEqual([pona, lili])
  })
})

describe('isComplementOf', () => {
  it('returns true for a complement', () => {
    const sentence = parseSentence('toki pona')
    const [toki, pona] = sentence.words

    expect(isComplementOf(toki, pona)).toBe(true)
  })
})

describe('isDescendantOf', () => {
  it('returns true for a complement of substantive', () => {
    const sentence = parseSentence('toki pona')
    const [toki, pona] = sentence.words

    expect(isDescendantOf(sentence, toki, pona)).toBe(true)
  })

  it('returns true for complement of complement', () => {
    const sentence = parseSentence('toki pi pona mute')
    const [toki, , , mute] = sentence.words

    expect(isDescendantOf(sentence, toki, mute)).toBe(true)
  })

  it('returns true for object of preposition', () => {
    const sentence = parseSentence('mi pona tawa sina')
    const [, , tawa, sina] = sentence.words

    expect(isDescendantOf(sentence, tawa, sina)).toBe(true)
  })

  it('returns true for an infinitive of a preverb', () => {
    const sentence = parseSentence('mi wile pana e sona')
    const [, wile, pana, , ] = sentence.words
    const parent = wile
    const child = pana

    expect(isDescendantOf(sentence, parent, child)).toBe(true)
  })

  it('returns true for subject of predicate', () => {
    const sentence = parseSentence('sina mute li pona')
    const [sina, , , pona] = sentence.words

    expect(isDescendantOf(sentence, pona, sina)).toBe(true)
  })

  it('returns true for context predicate of predicate', () => {
    const sentence = parseSentence('ken la o kama')
    const [ken, , , kama] = sentence.words

    expect(isDescendantOf(sentence, kama, ken)).toBe(true)
  })

  it('returns true for subject of context predicate', () => {
    const sentence = parseSentence('sina wile la mi kama')
    const [subject, contextPredicate] = sentence.words

    expect(isDescendantOf(sentence, contextPredicate, subject)).toBe(true)
  })
})
