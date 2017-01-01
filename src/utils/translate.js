// @flow
import { head } from 'ramda'
import maybe, { nothing } from './maybe'
import type { Sentence, Word } from './grammar'
import dic from './dictionary'

const PARTS_OF_SPEECH = [
  'x', // no lexical equivalent
  'adv',
  'n',
  'adj',
  'int',
  'num',
  'prep',
  'conj',
  'vt', // transitive verb
  'vi', // intransitive verb
  'vm', // modal verb
  'onom',
  'd', // determiner
  'dp', // plural determiner
  'ds', // singular determiner
  'pn', // 3rd-person caseless singular pronoun, or pu?/proper noun
  'pnp', // caseless plural pronoun
  'pnin', // 1st-person nominative singular pronoun
  'pnio', // 1st-person oblique singular pronoun
  'pnpn', // 3rd-person nominative plural pronoun
  'pnpo', // oblique plural pronoun
  'pns', // caseless singular pronoun
  'pnsn', // 3rd-person nominative singular pronoun
  'pnso', // 3rd-person oblique singular pronoun
  'pno', // oblique pronoun (cannot be subject, number maybe irrelevant)
]

const getEnglish = (word: Word) : { text: string, pos: string } => {
  const englishData = maybe(dic[word.text])
  const partOfSpeech = englishData.map(Object.keys, head)
  const getTranslationUnlessParticle = (pos) => pos !== 'p' ? englishData.map(pos) : nothing
  return partOfSpeech
    .then(getTranslationUnlessParticle)
    .map(head)
    .val('')
}

// export default function translate(sentences: Array<Sentence>, context: Object) {
export default function translate(sentences: Array<Sentence>) {
  return sentences.map(({ words }) => words.map(getEnglish))
}
