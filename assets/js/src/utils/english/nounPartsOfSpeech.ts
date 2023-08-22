import type { Case, GrammaticalNumber, EnglishPartOfSpeech } from "./grammar";

export const RESTRICTED_PRONOUN_PARTS_OF_SPEECH = {
  OBLIQUE_SINGULAR: ["pnio", "pnso", "pno", "pns"],
  OBLIQUE_PLURAL: ["pnpo", "pno", "pnp"],
  NOMINATIVE_SINGULAR: ["pnin", "pnsn", "pns", "pnsn"],
  NOMINATIVE_PLURAL: ["pnp", "pnpn"],
};

export const DETERMINER_PARTS_OF_SPEECH = {
  SINGULAR: ["d", "ds"],
  PLURAL: ["d", "dp"],
};

export const getPossiblePartsOfSpeech = (
  casus: Case,
  number: GrammaticalNumber
): Array<EnglishPartOfSpeech> => {
  const restricted =
    RESTRICTED_PRONOUN_PARTS_OF_SPEECH[`${casus}_${number}`] || [];
  return ["n", "pn", ...restricted];
};
