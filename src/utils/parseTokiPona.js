// @flow
import { parse } from 'parse-toki-pona'
import { pipe } from 'ramda'
import { normalize, schema } from 'normalizr'
import * as roles from '../utils/tokiPonaRoles'
import type { Role, RawParticleRole } from '../utils/tokiPonaRoles'
import type { Sentence, Word, WordId, Mood, TokiPonaPartOfSpeech, SentenceContext } from './grammar'
import { getId } from '../reducers/tpLemmas'
import type { TpLemmasState, TpLemma } from '../reducers/tpLemmas'

const wordSchema = new schema.Entity('words')
const sentenceSchema = new schema.Array(wordSchema)
const normalizeRawSentences = x => normalize(x, [sentenceSchema])

const RawParticleRoles = ({
  li: roles.INDICATIVE_PARTICLE,
  o: roles.OPTATIVE_PARTICLE,
  e: roles.DIRECT_OBJECT_PARTICLE,
  pi: roles.COMPOUND_COMPLEMENT_PARTICLE,
  en: roles.AND_PARTICLE,
  anu: roles.OR_PARTICLE,
  la: roles.CONTEXT_PARTICLE,
} : { [particle: string]: RawParticleRole })

export const getText = ({ before, text, after }: Word) : string =>
  before + text + after

export const getIndex = (word: ?Word) : number => word ? word.index : -1

type RawWord = {
  text: string,
  id: WordId,
  pos: string,
  role?: Role,
  head?: WordId,
  after?: string,
  before?: string,
  parent?: WordId,
  context?: number,
  // directObjects?: Array<WordId>,
  // infinitive?: WordId,
  // prepositionalObject?: WordId,
}

const getRole = (role: ?Role, text: string) : Role => role || RawParticleRoles[text]

type NormalizedSentence = Array<WordId>
type NormalizedWords = { [wordId: WordId]: RawWord }
type NormalizedSentences = { result: Array<NormalizedSentence>, entities: { words: NormalizedWords } }

type SentenceSlots = {
  mood: Mood,
  predicates: Array<WordId>,
  subjects?: Array<WordId>,
  contexts?: Array<SentenceContext>,
  vocative?: WordId,
  seme?: Array<WordId>,
}
export type WordsObject = { [wordId: WordId]: Word }
export type ParsedSentencesData = { sentences: Array<Sentence>, words: WordsObject, properNouns: Array<TpLemma> }


  //   predicate: '',          // i t prev prep
  //   context_predicate: '',  // i t prev prep
  //   complement: '',         // i prep         -- prev?
  //   f: '',         // i t prev prep

type PartiallyProcessedWord = { role: Role, text: string, before?: string, after?: string, head?: WordId, pos: TokiPonaPartOfSpeech }
const processWord = (
  sentenceProperties: SentenceSlots,
  rawWords: NormalizedWords,
  wordId: WordId,
  words: WordsObject,
  wordsInSameSentence: Array<WordId>, // should we just pass the whole sentence obj?
) : PartiallyProcessedWord => {
  const { id, text, before, after, head: headId, role: maybeRole, parent: parentId, context: contextIndex } = rawWords[wordId]
  const role = getRole(maybeRole, text)
  let pos = role.endsWith('PARTICLE') ? 'p' : 'i'

  switch (text) {
    case 'anu': {
      // const nextWordId = wordsInSameSentence[wordsInSameSentence.indexOf(wordId) + 1]
      // if (!nextWordId) throw new Error('whoops')
      // words[nextWordId].anu = true
      break
    }
    // case 'anu': {
    //   const nextWordId = wordsInSameSentence[wordsInSameSentence.indexOf(wordId) + 1]
    //   if (!(typeof nextWordId === 'string' && nextWordId in words)) throw new Error('whoops')
    //   words[nextWordId].anu = true
    //   break
    // }
    case 'ala': {
      const prevWordId = wordsInSameSentence[wordsInSameSentence.indexOf(wordId) - 1]
      if (!prevWordId) throw new Error('whoops')
      const prevWord = words[prevWordId]
      prevWord[role === 'NEGATIVE' ? 'negative' : 'interrogative'] = true
      if (role === 'INTERROGATIVE') sentenceProperties.mood = 'interrogative'
    }
    break
    case 'seme':
      sentenceProperties.mood = 'interrogative'
      sentenceProperties.seme = (sentenceProperties.seme || []).concat(id)
      break
    default:
      break
  }

  switch (role) {
    case roles.INTERROGATIVE:
      sentenceProperties.mood = 'interrogative'
      break
    case roles.OPTATIVE_PARTICLE:
      sentenceProperties.mood = sentenceProperties.mood === 'interrogative' ? sentenceProperties.mood : 'optative'
      break
    case roles.PREDICATE:
      sentenceProperties.predicates.push(id)
      break
    case roles.SUBJECT:
      sentenceProperties.subjects = sentenceProperties.subjects || []
      sentenceProperties.subjects.push(id)
      break
    case roles.CONTEXT_PREDICATE: {
      if (contextIndex === undefined) throw new Error('No context index for this predicate')
      const contexts = sentenceProperties.contexts = sentenceProperties.contexts || []
      const context = contexts[contextIndex] = contexts[contextIndex] || {}
      const predicates = context.predicates = context.predicates || []
      predicates.push(id)
      break
    }
    case roles.CONTEXT_SUBJECT: {
      if (contextIndex === undefined) throw new Error('No context index for this subject')
      const contexts = sentenceProperties.contexts = sentenceProperties.contexts || []
      const context = contexts[contextIndex] = contexts[contextIndex] || {}
      const subjects = context.subjects = context.subjects || []
      subjects.push(id)
      break
    }
    case roles.VOCATIVE:
      sentenceProperties.vocative = id
      break
    case roles.COMPLEMENT: {
      if (!headId) throw new Error('whoops')
      const head = words[headId] = words[headId] || processWord(sentenceProperties, rawWords, headId, words, wordsInSameSentence)
      const headComplements = head.complements = head.complements || []
      headComplements.push(id)
      break
    }
    case roles.DIRECT_OBJECT: {
      if (!parentId) throw new Error('No verb linked to this direct object')
      const parent = words[parentId]
      parent.pos = 't'
      const directObjects = parent.directObjects = parent.directObjects || []
      directObjects.push(id)
      break
    }
    case roles.INFINITIVE: {
      if (!parentId) throw new Error('No verb linked to this infinitive')
      const parent = words[parentId]
      parent.pos = 'prev'
      parent.infinitive = wordId
      break
    }
    case roles.PREPOSITIONAL_OBJECT: {
      if (!parentId) throw new Error('No verb linked to this infinitive')
      const parent = words[parentId]
      parent.pos = 'prep'
      parent.prepositionalObject = wordId
      break
    }
    default:
      break
  }

  return {
    role,
    text,
    ...(headId ? { head: headId } : null),
    before: before || '',
    after: after || '',
    pos,
  }
}

const addRelations = (tpLemmas: TpLemmasState) => (ns: NormalizedSentences) : ParsedSentencesData => {
  const { result, entities: { words: rawWords } } = ns

  const [sentences, words, , properNouns] = result
    .reduce((accumulator, wordIds: Array<WordId>, sentenceIndex: number) => {
      const [allSentences, words, position, properNounLemmas] = accumulator
      let sentenceProperties : SentenceSlots = { mood: 'indicative', predicates: [] } // filled out in processWord

      wordIds.forEach((wordId, i) => {
        const processed = processWord(sentenceProperties, rawWords, wordId, words, result[sentenceIndex])
        const lemmaId = getId(tpLemmas, processed.text, processed.pos)
          || rawWords[wordId].text // proper nouns
        if (!Number.isInteger(lemmaId)) properNounLemmas.push({
          text: processed.text,
          id: processed.text,
          pos: processed.pos,
          animacy: null,
          primary: null,
        })


        words[wordId] = ({
          ...(words[wordId] || {}),
          sentence: sentenceIndex,
          index: i + position,
          id: wordId,
          ...processed,
          lemmaId,
        } : Word)
      })

      accumulator[2] += wordIds.length

      allSentences.push({ index: sentenceIndex, words: wordIds, ...sentenceProperties })

      return accumulator
    }, [[], {}, 0, []])

  return {
    sentences,
    words,
    properNouns,
  }
}

type ParseTokiPona =  (s: string, tpLemmas: TpLemmasState) => ParsedSentencesData
const parseTokiPona : ParseTokiPona = (text, tpLemmas) => pipe(parse, normalizeRawSentences, addRelations(tpLemmas))(text)

export default parseTokiPona
