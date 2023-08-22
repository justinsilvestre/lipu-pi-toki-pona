import type { Action } from "../actions";
import type { EnLemmaId } from "./enLemmas";
import type { TpLemmaId } from "./tpLemmas";

export type PhraseTranslationId = number;
export type PhraseTranslation = {
  id: PhraseTranslationId;
  enLemmaId: EnLemmaId;
  tpLemmaId: TpLemmaId;
};

export type State = {
  [id: PhraseTranslationId]: PhraseTranslation;
};
