import type { TpWordsState } from "../selectors/tpWords";
import type { Sentence } from "../selectors/tpSentences";
import type { SentenceTranslation } from "../utils/english/grammar";
import type { TpLemmasState, TpLemma } from "../selectors/tpLemmas";
import type { EnWord, EnWordId, EnWordsState } from "../selectors/enWords";

export type Action =
  | {
      type: "PARSE_SENTENCES_SUCCESS";
      tpSentences: Array<Sentence>;
      tpWords: TpWordsState;
      properNouns: Array<TpLemma>;
    }
  | { type: "PARSE_SENTENCES"; text: string; tpLemmas: TpLemmasState }
  | { type: "PARSE_SENTENCES_FAILURE" }
  | {
      type: "TRANSLATE_SENTENCES_SUCCESS";
      enSentences: Array<SentenceTranslation>;
      enWords: Array<Array<EnWord>>;
    }
  | {
      type: "UPDATE_SENTENCE";
      index: number;
      sentence: SentenceTranslation;
      words: Array<EnWord>;
    }
  | {
      type: "UPDATE_SENTENCE_FAILURE";
      err: any;
    };

export const parseSentencesSuccess = (
  tpSentences: Array<Sentence>,
  tpWords: TpWordsState,
  properNouns: Array<TpLemma>
): Action => ({
  type: "PARSE_SENTENCES_SUCCESS",
  tpSentences,
  tpWords,
  properNouns,
});

export const parseSentencesFailure = () => ({
  type: "PARSE_SENTENCES_FAILURE",
});

export const parseSentences = (text: string, tpLemmas: TpLemmasState) => ({
  type: "PARSE_SENTENCES",
  text,
  tpLemmas,
});

export const translateSentencesSuccess = (
  enSentences: Array<SentenceTranslation>,
  enWords: EnWord[][]
): Action => ({
  type: "TRANSLATE_SENTENCES_SUCCESS",
  enSentences,
  enWords,
});

export const updateSentence = (
  index: number,
  sentence: SentenceTranslation,
  words: Array<EnWord>
): Action => ({
  type: "UPDATE_SENTENCE",
  index,
  sentence,
  words,
});
