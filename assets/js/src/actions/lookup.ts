import type {
  PhraseTranslation,
  State as PhraseTranslationState,
} from "../selectors/phraseTranslations";
import {
  lookUpTranslation,
  getEnWordFromTp,
  getWord,
  isNewProperNoun,
  getPhraseTranslation,
  getEnLemma,
  getTpWords,
  getTpLemmas,
  lookUpTranslationId,
} from "../selectors";
import type { TpWordsState, Word } from "../selectors/tpWords";
import type { AppState } from "../selectors";
import type { EnLemma, EnLemmaId, EnLemmasState } from "../selectors/enLemmas";
import type { TpLemmaId, TpLemmasState } from "../selectors/tpLemmas";
import type { WordId } from "../selectors/tpWords";
import type { EnglishPartOfSpeech } from "../utils/english/grammar";
import type { EnWord } from "../selectors/enWords";
import { newPlaceholder } from "../selectors/enWords";
import { v4 } from "uuid";
import fetchTranslation_ from "./fetchTranslation";

export type Action =
  | {
      type: "ADD_PHRASE_TRANSLATION";
      phraseTranslation: PhraseTranslation;
      enLemma: EnLemma;
      enWord: EnWord;
    }
  | {
      type: "ADD_PHRASE_TRANSLATIONS";
      phraseTranslations: PhraseTranslationState;
      enLemmas: EnLemmasState;
    }
  | {
      type: "SET_WORD_TRANSLATION";
      phraseTranslationId: number;
      wordId: WordId;
    }
  | {
      type: "CHANGE_WORD_TRANSLATION";
      phraseTranslationId: number;
      wordId: WordId;
    }
  | {
      type: "CLEAR_EN_SENTENCES";
    };

export type Lookup = {
  //temp
  words: TpWordsState;
  tpLemmas: TpLemmasState;

  translate: (
    wordId: WordId,
    enPartsOfSpeech?: Array<EnglishPartOfSpeech>
  ) => Promise<{
    enLemma?: EnLemma | null;
    phraseTranslation?: PhraseTranslation | null;
    enWord?: EnWord | null;
  }>;
  // browse: (tpLemmaId: string, enPartsOfSpeech: Array<EnglishPartOfSpeech>) => Promise<Array<PhraseTranslation>>
};

export const addPhraseTranslation = (
  phraseTranslation: PhraseTranslation,
  enLemma: EnLemma,
  enWord: EnWord
): Action => ({
  type: "ADD_PHRASE_TRANSLATION",
  phraseTranslation,
  enLemma,
  enWord,
});

export const addPhraseTranslations = (
  phraseTranslations: PhraseTranslationState,
  enLemmas: EnLemmasState
): Action => ({
  type: "ADD_PHRASE_TRANSLATIONS",
  phraseTranslations,
  enLemmas,
});

export const setWordTranslation = (
  wordId: WordId,
  phraseTranslationId: number
): Action => ({
  type: "SET_WORD_TRANSLATION",
  wordId,
  phraseTranslationId,
});
export const changeWordTranslation = (
  wordId: WordId,
  phraseTranslationId: number
): Action => ({
  type: "CHANGE_WORD_TRANSLATION",
  wordId,
  phraseTranslationId,
});
//
// export type RawPhraseTranslation = {
//   id: number,
//   tp: number,
//   en: {
//     id: number,
//     text: string,
//     pos: EnglishPartOfSpeech,
//   }
// }
//
// export type RawPhraseTranslations = {
//   phraseTranslations: Array<RawPhraseTranslation>,
// }
//
// export const processTranslationsResponse = ({ phraseTranslations: raw }: RawPhraseTranslations) => {
//   const enLemmas = {}
//   const phraseTranslations = {}
//   for (const rawPhraseTranslation of raw) {
//     const { id, en: rawEnLemma, tp: tpLemmaId } = rawPhraseTranslation
//     const { id: enLemmaId, text, pos } = rawEnLemma
//     phraseTranslations[id] = {
//       id,
//       tpLemmaId,
//       enLemmaId,
//     }
//     enLemmas[enLemmaId] = {
//       id: enLemmaId,
//       text,
//       pos,
//     }
//   }
//   return { phraseTranslations, enLemmas}
// }
//
// export type ProcessedTranslationResponse = {
//   enLemma: EnLemma,
//   phraseTranslation: PhraseTranslation,
// }
// const processTranslationResponse = ({ phraseTranslation: raw }: { phraseTranslation: RawPhraseTranslation }): ProcessedTranslationResponse => {
//   const enLemma = {
//     id: raw.en.id,
//     text: raw.en.text,
//     pos: raw.en.pos,
//   }
//   const phraseTranslation = {
//     id: raw.id,
//     enLemmaId: raw.en && raw.en.id,
//     tpLemmaId: raw.tp,
//   }
//
//   return { enLemma, phraseTranslation }
// }
//
// export const fetchTranslation = async (tpLemmaId: TpLemmaId, enPartsOfSpeech?: Array<EnglishPartOfSpeech>): Promise<?ProcessedTranslationResponse> => {
//   const opts = { tpLemmaId, ...(enPartsOfSpeech ? { enPartsOfSpeech } : null) }
//   const response = await pull('look_up_one', opts)
//   return response.phraseTranslation
//     ? processTranslationResponse(response)
//     : null
// }
//
// export const fetchTranslations = async (tpLemmaId: string, enPartsOfSpeech?: Array<EnglishPartOfSpeech>) => {
//   const opts = { tpLemmaId, ...(enPartsOfSpeech ? { enPartsOfSpeech } : null) }
//   const response = await pull('look_up_many', opts)
//   return processTranslationsResponse(response)
// }

export function getLookupSelectors(getState: () => AppState) {
  return {
    getTpWords: () => getTpWords(getState()),
    getTpLemmas: () => getTpLemmas(getState()),
    getEnLemma: (enLemmaId: EnLemmaId) => getEnLemma(getState(), enLemmaId),
    getWord: (tpWordId: string) => getWord(getState(), tpWordId),
    isNewProperNoun: (tpLemmaId: TpLemmaId) =>
      isNewProperNoun(getState(), tpLemmaId),
    lookUpTranslation: (wordId: string) =>
      lookUpTranslation(getState(), wordId),
    lookUpTranslationId: (wordId: WordId) =>
      lookUpTranslationId(getState(), wordId),
  };
}

type FetchTranslation = typeof fetchTranslation_;

export default function lookup({
  selectors: {
    getTpWords,
    getTpLemmas,
    getEnLemma,
    getWord,
    isNewProperNoun,
    lookUpTranslation,
  },
  dispatch,
  uuidV4 = v4,
  fetchTranslation = fetchTranslation_,
}: {
  selectors: {
    getTpWords(): TpWordsState;
    getTpLemmas(): TpLemmasState;
    getEnLemma(enLemmaId: EnLemmaId): EnLemma;
    getWord(tpWordId: string): Word;
    isNewProperNoun(tpLemmaId: TpLemmaId): boolean;
    lookUpTranslation(wordId: WordId): PhraseTranslation | null;
    lookUpTranslationId(wordId: WordId): PhraseTranslation["id"] | null;
  };
  dispatch: Function;
  uuidV4?: () => string;
  fetchTranslation?: FetchTranslation;
}): Lookup {
  return {
    words: getTpWords(),
    tpLemmas: getTpLemmas(),
    translate: async (wordId, enPartsOfSpeech) => {
      const tpWord = getWord(wordId);
      const { lemmaId: tpLemmaId, text: tpText } = tpWord;
      if (!tpLemmaId) throw new Error("whoops" + tpText);

      const enWordId = uuidV4();

      if (isNewProperNoun(tpLemmaId)) {
        // return { phraseTranslation: { tpLemmaId, enLemmaId: null }, enLemma: { text: tpLemmaId, pos: "prop" } }
        const enWord = newPlaceholder(enWordId, tpText, wordId);
        return { phraseTranslation: null, enLemma: null, enWord };
      }

      // const existingEnWord = getEnWordFromTp(state, wordId)
      // const existingTranslationIsValid = existingEnWord
      //   && existingEnWord.hasOwnProperty('phraseTranslationId')
      //   && existingEnWord.phraseTranslationId
      //   && (!enPartsOfSpeech || enPartsOfSpeech.includes(existingEnWord.pos))
      const existingTranslation = lookUpTranslation(wordId);
      const existingTranslationIsValid =
        existingTranslation &&
        (!enPartsOfSpeech ||
          enPartsOfSpeech.includes(
            getEnLemma(existingTranslation.enLemmaId).pos
          ));

      if (existingTranslation && existingTranslationIsValid) {
        // if (!existingEnWord) throw new Error('whoops')
        // if (!existingEnWord.phraseTranslationId) throw new Error('whoops')
        console.log(
          `EXISTING TRANSLATION FOR ${tpText} is valid`,
          existingTranslation
        );
        const phraseTranslation = existingTranslation;

        console.log("translated to: ", phraseTranslation);
        const enLemma = getEnLemma(phraseTranslation.enLemmaId);
        const enWord = {
          id: enWordId,
          pos: enLemma.pos,
          text: enLemma.text,
          phraseTranslationId: phraseTranslation.id,
          tpWordId: wordId,
        };
        return {
          phraseTranslation,
          enLemma,
          enWord,
        };
      } else {
        const translation = await fetchTranslation(tpLemmaId, enPartsOfSpeech);

        if (translation) {
          const { phraseTranslation, enLemma } = translation;
          const enWord = {
            id: enWordId,
            pos: enLemma.pos,
            text: enLemma.text,
            phraseTranslationId: phraseTranslation.id,
            tpWordId: wordId,
          };

          dispatch(addPhraseTranslation(phraseTranslation, enLemma, enWord));
          // const translationNotYetSet =
          //   lookUpTranslationId(wordId) !==
          //   phraseTranslation.id;
          // dispatch(setWordTranslation(wordId, phraseTranslation.id))
          //   console.log(translationNotYetSet && enLemma.text)
          return { phraseTranslation, enLemma, enWord };
        } else {
          dispatch({ type: "INVALID_OPTION", tpWord });
          return { phraseTranslation: null, enLemma: null, enWord: null };
        }
      }
    },
    // browse: async (tpLemmaId, enPartsOfSpeech) => {
    // }
  };
}
