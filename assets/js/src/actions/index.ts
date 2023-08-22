import type { Action as SentenceAction } from "./sentence";
import type { Action as MouseAction } from "./mouse";
import type { Action as LookupAction } from "./lookup";

export type Action = SentenceAction | MouseAction | LookupAction;

export * from "./sentence";
export * from "./mouse";
export * from "./lookup";
export * from "./fetchTranslation";
