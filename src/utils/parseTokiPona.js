// @flow
import { parse } from 'parse-toki-pona'
import { pipe, last } from 'ramda'
import { normalize, schema } from 'normalizr'
import type { Sentence, Word, WordId, Mood, Role, RawParticleRole } from './grammar'

const wordSchema = new schema.Entity('words')
const sentenceSchema = new schema.Array(wordSchema)
const normalizeRawSentences = window.n = x => normalize(x, [sentenceSchema])

const RawParticleRoles = ({
  li: 'indicative_particle',
  o: 'optative_particle',
  e: 'direct_object_particle',
  pi: 'compound_complement_particle',
  en: 'and_particle',
  anu: 'or_particle',
  la: 'context_particle'
} : { [particle: string]: RawParticleRole })

export const getText = ({ before, text, after }: Word) : string =>
  before + text + after

export const getIndex = (word: ?Word) : number => word ? word.index : -1

type RawWord = {
  text: string,
  id: WordId,
  role?: Role,
  head?: WordId,
  after?: string,
  before?: string,

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
  contexts?: Array<WordId>,
  vocative?: WordId,
}
export type WordsObject = { [wordId: WordId]: Word }
export type ParsedSentencesData = { sentences: Array<Sentence>, words: WordsObject }


  //   predicate: '',          // i t prev prep
  //   context_predicate: '',  // i t prev prep
  //   complement: '',         // i prep         -- prev?
  //   f: '',         // i t prev prep

type PartiallyProcessedWord = { role: Role, text: string, before?: string, after?: string, head?: WordId }
const processWord = (sentenceProperties: SentenceSlots, rawWords: NormalizedWords, wordId: WordId, words: WordsObject) : PartiallyProcessedWord => {
  const { id, text, before, after, head: headId, role: maybeRole } = rawWords[wordId]
  const role = getRole(maybeRole, text)

  switch (role) {
    case 'optative_particle':
      sentenceProperties.mood = sentenceProperties.mood === 'interrogative' ? sentenceProperties.mood : 'optative'
      break
    case 'predicate':
      sentenceProperties.predicates.push(id)
      break
    case 'subject':
      sentenceProperties.subjects = sentenceProperties.subjects || []
      sentenceProperties.subjects.push(id)
      break
    case 'vocative':
      sentenceProperties.vocative = id
      break
    case 'complement': {
      if (headId) {
        const head = words[headId] = words[headId] || processWord(sentenceProperties, rawWords, headId, words)
        const headComplements = head.complements = head.complements || []
        headComplements.push(id)
      }
    }
    break
    case 'direct_object': {
      const parent = last(sentenceProperties.predicates)
      if (!parent) throw new Error('whoops')
      const directObjects = words[parent].directObjects = words[parent].directObjects || []
      directObjects.push(id)
    }
      break
    case 'infinitive': {
      // prepositionalObject?: WordId,
    }
      break
    default:
      break
  }

  return {
    role,
    text,
    ...(headId ? { head: headId } : null),
    before: before || '',
    after: after || '',
  }
}

const addRelations = (ns: NormalizedSentences) : ParsedSentencesData => {
  const { result, entities: { words: rawWords } } = ns

  const [sentences, words] = result
    .reduce((accumulator, wordIds: Array<WordId>, sentenceIndex: number) => {
      const [allSentences, words, position] = accumulator
      let sentenceProperties : SentenceSlots = { mood: 'indicative', predicates: [] } // filled out in processWord

      wordIds.forEach((wordId, i) => {
        words[wordId] = ({
          ...(words[wordId] || {}),
          sentence: sentenceIndex,
          index: i + position,
          id: wordId,
          ...processWord(sentenceProperties, rawWords, wordId, words),
        } : Word)
      })

      accumulator[2] += wordIds.length

      allSentences.push({ index: sentenceIndex, words: wordIds, ...sentenceProperties })

      return accumulator
    }, [[], {}, 0])

  return {
    sentences,
    words,
  }
}

type ParseTokiPona =  (s: string) => ParsedSentencesData
const parseTokiPona : ParseTokiPona = pipe(parse, normalizeRawSentences, addRelations)

export default parseTokiPona
