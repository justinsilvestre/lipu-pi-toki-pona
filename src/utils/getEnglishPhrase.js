// // @flow
// import maybe from './maybe'
// import type { Word, WordId, EnglishPartOfSpeech } from './grammar'
// import * as roles from './tokiPonaRoles'
// import dic from './dictionary'
// import type { WordsObject } from './parseTokiPona'
//
// export type EnglishPartOfSpeech =
//   'x' // no lexical equivalent
//   | 'adv'
//   | 'n'
//   | 'adj'
//   | 'int'
//   | 'num'
//   | 'prep'
//   | 'conj'
//   | 'vt' // transitive verb
//   | 'vi' // intransitive verb
//   | 'vm' // modal verb
//   | 'onom'
//   | 'd' // determiner
//   | 'dp' // plural determiner
//   | 'ds' // singular determiner
//   | 'pn' // 3rd-person caseless singular pronoun, or pu?/proper noun
//   | 'pnp' // caseless plural pronoun
//   | 'pnin' // 1st-person nominative singular pronoun
//   | 'pnio' // 1st-person oblique singular pronoun
//   | 'pnpn' // nominative plural pronoun
//   | 'pnpo' // oblique plural pronoun
//   | 'pns' // caseless singular pronoun
//   | 'pnsn' // 3rd-person nominative singular pronoun
//   | 'pnso' // 3rd-person oblique singular pronoun
//   | 'pno' // oblique pronoun (cannot be subject, number maybe irrelevant)
//
// const singular = ({ complements = [], id }, words, context) => complements.every(c => words[c].text !== 'mute')
// // const singular = ({ id }, words, context) => context[id].includes('mute')
//
// const partOfSpeechRules = ({
//   [roles.SUBJECT]: {
//     pn: () => true,
//     pnp: () => true,
//     pns: singular,
//     pnsn: singular,
//     pnin: singular,
//     pnpn: () => true,
//     n: () => true,
//   },
//   [roles.CONTEXT_SUBJECT]: {
//     n: () => true
//   },
//   [roles.PREDICATE]: {
//     vm: () => true,
//     vi: () => true,
//     vt: ({ role }) => role !== 'i',
//     prep: () => true,
//
//     pn: () => true,
//     pnp: () => true,
//     pnio: singular,
//     pnpo: () => true,
//     pns: singular,
//     pnso: singular,
//     pnsn: singular,
//     pnin: singular,
//     n: () => true,
//   },
//   [roles.COMPLEMENT]: {
//     adv: ({ head, text }, words) => console.log(text, words[head]) || words[head].pos === 't',
//     d: ({ head }, words) => true,
//     dp: ({ head }, words) => true,
//     ds: ({ head }, words) => true,
//     adj: ({ head }, words) => true,
//     prep: ({ role }, words) =>  true,
//     n: () => true,
//     // adjective if head is noun
//     // adverb if head is verb
//   },
//   [roles.DIRECT_OBJECT]: {
//     pn: () => true,
//     pnp: () => true,
//     pnio: singular,
//     pnpo: () => true,
//     pns: singular,
//     pnso: singular,
//     n: () => true,
//   },
//   [roles.PREPOSITIONAL_OBJECT]: {
//     pn: () => true,
//     pnp: () => true,
//     pnio: singular,
//     pnpo: () => true,
//     pns: singular,
//     pnso: singular,
//     n: () => true,
//   },
//   [roles.INFINITIVE]: {
//     vi: () => true,
//     vt: () => true,
//     vm: () => true,
//   }
// } : Object
// // : { [pos: EnglishPartOfSpeech]: Object }
// )
// // subject head is a noun.
// // intransitive predicate head is a verb or noun + copula.
// // transitive predicate head is a transitive verb
// //
//
// // unmarked subj/predicate head can have any of these determiners:
//     // a the some 0
//     //
//
// // if final complement can be translated with determiner, usually do.
//
// const corresponds = (tokiPonaWord: Word, englishPartOfSpeech: EnglishPartOfSpeech, words: WordsObject) : boolean => {
//   const { role, text } = tokiPonaWord
//   const testsForRole = partOfSpeechRules[role]
//
//   if (testsForRole) {
//     return (testsForRole[englishPartOfSpeech] || (() => false))(tokiPonaWord, words)
//   }
//
//   return false
// }
//
// export type WordTranslation = { text: string, pos: string, tokiPona?: WordId }
//
// export type ContextObject = {}
//
// // const getEnglishPhrase = (word: Word, words: WordsObject) : ?WordTranslation => {
// const getEnglishPhrase = (word: Word, words: WordsObject) : WordTranslation => {
//   // console.log(dic[word.text])
//   // console.log(dic[word.text] && dic[word.text][word.pos])
//   const translations = maybe(dic).map(word.text, word.pos).val([])
//   const translation = translations.find(t => corresponds(word, t.pos, words))
//     || translations.find(t => !t.pos.startsWith('x'))
//     console.log('english pos for ', word.text, translation && translation.pos)
//   // return translation && { text: translation.text, pos: translation.pos, tokiPona: word.id }
//   return translation
//     ? { text: translation.text, pos: translation.pos, tokiPona: word.id }
//     : {}
// }
// export default getEnglishPhrase
