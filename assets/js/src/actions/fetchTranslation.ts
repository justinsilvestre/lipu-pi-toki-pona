import type {
  PhraseTranslation,
  State as PhraseTranslationState,
} from "../selectors/phraseTranslations";
import channel, { pull } from "../utils/channel";
import type { EnLemma, EnLemmasState } from "../selectors/enLemmas";
import type { TpLemmaId, TpLemmasState } from "../selectors/tpLemmas";
import type { EnglishPartOfSpeech } from "../utils/english/grammar";
import type { EnWord } from "../selectors/enWords";

export type RawPhraseTranslation = {
  id: number;
  tp: number;
  en: {
    id: number;
    text: string;
    pos: EnglishPartOfSpeech;
  };
};
export type RawPhraseTranslations = {
  phraseTranslations: Array<RawPhraseTranslation>;
};

export type ProcessedTranslationResponse = {
  enLemma: EnLemma;
  phraseTranslation: PhraseTranslation;
};

const processTranslationResponse = ({
  phraseTranslation: raw,
}: {
  phraseTranslation: RawPhraseTranslation;
}): ProcessedTranslationResponse => {
  const enLemma = {
    id: raw.en.id,
    text: raw.en.text,
    pos: raw.en.pos,
  };
  const phraseTranslation = {
    id: raw.id,
    enLemmaId: raw.en && raw.en.id,
    tpLemmaId: raw.tp,
  };

  return { enLemma, phraseTranslation };
};

export const processTranslationsResponse = ({
  phraseTranslations: raw,
}: RawPhraseTranslations) => {
  const enLemmas = {};
  const phraseTranslations = {};
  for (const rawPhraseTranslation of raw) {
    const { id, en: rawEnLemma, tp: tpLemmaId } = rawPhraseTranslation;
    const { id: enLemmaId, text, pos } = rawEnLemma;
    phraseTranslations[id] = {
      id,
      tpLemmaId,
      enLemmaId,
    };
    enLemmas[enLemmaId] = {
      id: enLemmaId,
      text,
      pos,
    };
  }
  return { phraseTranslations, enLemmas };
};

const fetchTranslation = async (
  tpLemmaId: TpLemmaId,
  enPartsOfSpeech?: Array<EnglishPartOfSpeech>
): Promise<ProcessedTranslationResponse | null | undefined> => {
  const opts = { tpLemmaId, ...(enPartsOfSpeech ? { enPartsOfSpeech } : null) };
  const response = await pull("look_up_one", opts);
  return (response as unknown as any).phraseTranslation
    ? processTranslationResponse(
        response as unknown as any as {
          phraseTranslation: RawPhraseTranslation;
        }
      )
    : null;
};

export default fetchTranslation;
