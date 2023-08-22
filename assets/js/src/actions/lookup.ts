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
} from "../selectors";
import channel, { pull } from "../utils/channel";
import type { TpWordsState } from "../selectors/tpWords";
import type { AppState } from "../selectors";
import type { EnLemma, EnLemmasState } from "../selectors/enLemmas";
import type { TpLemmaId, TpLemmasState } from "../selectors/tpLemmas";
import type { WordId } from "../selectors/tpWords";
import type { EnglishPartOfSpeech } from "../utils/english/grammar";
import type { EnWord } from "../selectors/enWords";
import { newPlaceholder } from "../selectors/enWords";
import { v4 } from "uuid";
import fetchTranslation from "./fetchTranslation";

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

export default function lookup(getState: Function, dispatch: Function): Lookup {
  const state: AppState = getState();
  return {
    words: getTpWords(state),
    tpLemmas: getTpLemmas(state),
    translate: async (wordId, enPartsOfSpeech) => {
      const tpWord = getWord(getState(), wordId);
      const { lemmaId: tpLemmaId, text: tpText } = tpWord;
      if (!tpLemmaId) throw new Error("whoops" + tpText);

      const enWordId = v4();

      if (isNewProperNoun(state, tpLemmaId)) {
        // return { phraseTranslation: { tpLemmaId, enLemmaId: null }, enLemma: { text: tpLemmaId, pos: "prop" } }
        const enWord = newPlaceholder(enWordId, tpText, wordId);
        return { phraseTranslation: null, enLemma: null, enWord };
      }

      // const existingEnWord = getEnWordFromTp(state, wordId)
      // const existingTranslationIsValid = existingEnWord
      //   && existingEnWord.hasOwnProperty('phraseTranslationId')
      //   && existingEnWord.phraseTranslationId
      //   && (!enPartsOfSpeech || enPartsOfSpeech.includes(existingEnWord.pos))
      const existingTranslation = lookUpTranslation(state, wordId);
      const existingTranslationIsValid =
        existingTranslation &&
        (!enPartsOfSpeech ||
          enPartsOfSpeech.includes(
            getEnLemma(state, existingTranslation.enLemmaId).pos
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
        const enLemma = getEnLemma(state, phraseTranslation.enLemmaId);
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
          const translationNotYetSet =
            getState().documentTranslationPhrases[wordId] !==
            phraseTranslation.id;
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
