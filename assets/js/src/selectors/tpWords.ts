import type { Action } from "../actions";
import type { Role } from "../utils/tokiPonaRoles";
import type { TpLemmaId } from "./tpLemmas";
import { v4 } from "uuid";

export type WordId = string;

export type TokiPonaPartOfSpeech = "i" | "t" | "prev" | "prep" | "p";

export type Word = {
  id: WordId;
  text: string;
  index: number;
  sentence: number;
  before: string;
  after: string;
  role: Role;
  pos: TokiPonaPartOfSpeech;

  lemmaId: TpLemmaId;

  anu?: boolean;
  negative?: boolean;
  interrogative?: boolean;
  head?: WordId;
  complements?: Array<WordId>;
  directObjects?: Array<WordId>;
  infinitive?: WordId;
  prepositionalObject?: WordId;
  context?: number;
};

export type TpWordsState = { [wordId: WordId]: Word };

export const newWord = (
  text: string,
  id: WordId,
  pos: TokiPonaPartOfSpeech = "i",
  role: Role = "PREDICATE",
  lemmaId: TpLemmaId = "xxx",
  index: number = 0,
  sentence: number = 0,
  before: string = "",
  after: string = ""
): Word => ({
  id: id || v4(),
  text,
  pos,
  role,
  index,
  sentence,
  before,
  after,
  lemmaId,
});
