// @flow
import expect from 'expect'
import translate from './translate'
// maybe should be translatePhrases, then combinePhrases to synthesize phrase translations into whole sentences
import parseTokiPona from './parseTokiPona'

describe('translate()', () => {
  describe('devoid of context', () => {
    it('translates TP subject into EN noun phrase', () => {
      const { sentences, words } = parseTokiPona('toki li pona')
      const sentenceTranslation = translate(sentences, words)[0]
      const [toki] = sentences[0].words
      const tokiTranslation = sentenceTranslation.find((phrase) => phrase.tp === toki)

      expect(tokiTranslation).toInclude({ pos: 'n' })
    })

    it('translate TP i-predicate into EN verb phrase when most common translation is an EN verb phrase', () => {
      const { sentences, words } = parseTokiPona('jan li toki')
      const sentenceTranslation = translate(sentences, words)[0]
      const [,, toki] = sentences[0].words
      const tokiTranslation = sentenceTranslation.find((phrase) => phrase.tp === toki)

      expect(tokiTranslation).toInclude({ pos: 'vi' })
    })

    it('translates TP i-predicate into EN noun phrase when most common translation is an EN noun phrase', () => {
      const { sentences, words } = parseTokiPona('ona li akesi')
      const sentenceTranslation = translate(sentences, words)[0]
      const [,, akesi] = sentences[0].words
      const akesiTranslation = sentenceTranslation.find((phrase) => phrase.tp === akesi)

      expect(akesiTranslation).toInclude({ pos: 'n' })
    })

    it('translates TP complement into EN determiner when head translates to noun phrase and complement\'s most common translation is determiner', () => {
      const { sentences, words } = parseTokiPona('kili mute li lili')
      const sentenceTranslation = translate(sentences, words)[0]
      const [,mute] = sentences[0].words
      const muteTranslation = sentenceTranslation.find((phrase) => phrase.tp === mute)

      expect(muteTranslation).toInclude({ pos: 'dp' })
    })

    it('translates a TP i-substantive as a pronoun when it is xxxxxxxx unmodified noun phrase')
  })
})
