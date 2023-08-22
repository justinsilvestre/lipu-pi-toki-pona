import type { Sentence } from "../selectors/tpSentences";
import type {
  SentenceTranslation,
  EnglishPartOfSpeech,
} from "./english/grammar";
import type { TpWordsState } from "../selectors/tpWords";
// import { map, flatten, intersperse, last } from 'ramda'
import sentence, { realizeSentence } from "./english/sentence";
import type { Lookup } from "../actions/lookup";

export type WordTranslation = {
  text: string;
  pos: EnglishPartOfSpeech;
};

export default async function translate(
  sentences: Array<Sentence>,
  words: TpWordsState,
  lookup: Lookup
): Promise<Array<SentenceTranslation>> {
  return Promise.all(sentences.map((s) => sentence(lookup, s)));
}
