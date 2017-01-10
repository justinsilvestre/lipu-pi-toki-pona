// @flow
import { head } from 'ramda'
import maybe, { nothing } from './maybe'
import type { Sentence, Word } from './grammar'
import dic from './dictionary'

export type EnglishPartOfSpeech =
  'x' // no lexical equivalent
  | 'adv'
  | 'n'
  | 'adj'
  | 'int'
  | 'num'
  | 'prep'
  | 'conj'
  | 'vt' // transitive verb
  | 'vi' // intransitive verb
  | 'vm' // modal verb
  | 'onom'
  | 'd' // determiner
  | 'dp' // plural determiner
  | 'ds' // singular determiner
  | 'pn' // 3rd-person caseless singular pronoun, or pu?/proper noun
  | 'pnp' // caseless plural pronoun
  | 'pnin' // 1st-person nominative singular pronoun
  | 'pnio' // 1st-person oblique singular pronoun
  | 'pnpn' // 3rd-person nominative plural pronoun
  | 'pnpo' // oblique plural pronoun
  | 'pns' // caseless singular pronoun
  | 'pnsn' // 3rd-person nominative singular pronoun
  | 'pnso' // 3rd-person oblique singular pronoun
  | 'pno' // oblique pronoun (cannot be subject, number maybe irrelevant)

const subject = [{ phrase: 'noun' }]
const posRules = ({
  subject,
  context_subject: subject,
  predicate: [{ phrase: 'verb' }]
}
// : { [pos: EnglishPartOfSpeech]: Object }
)
// subject head is a noun.
// intransitive predicate head is a verb or noun + copula.
// transitive predicate head is a transitive verb
//

// unmarked subj/predicate head can have any of these determiners:
    // a the some 0
    //

const getPosFromRole = ({ role }: Word) : ?EnglishPartOfSpeech  => // should also accept context?
  (role === 'subject' && 'n')
  || null

type WordTranslation = { text: string, pos: string }

// const getEnglish = (word: Word) : WordTranslation => {
//   const pos = getPosFromRole(word) || 'nope'
//   return maybe(dic[word.text]).map(pos).val('')
//
//   return maybe(dic[word.text])
//     .map(({ }))
//
//
//
//   // const englishData = maybe(dic[word.text])
//   // const partOfSpeech = englishData.map(Object.keys, head)
//   // return partOfSpeech
//   //   .then((pos) => pos !== 'p' ? englishData.map(pos) : nothing)
//   //   .map(head)
//   //   .val('')
// }

export type SentenceTranslation = Array<WordTranslation>

export default function translate(sentences: Array<Sentence>) : Array<SentenceTranslation> {
  return sentences.map(({ words }) => words.map(w => ({ text: 'asdf', pos: 'a' })))
  // return sentences.map(({ words }) => words.map(getEnglish))
}
