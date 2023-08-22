import predicatePhrase, { realizePredicatePhrase } from "./predicatePhrase";
import subjectPhrase, { realizeSubjectPhrase } from "./subjectPhrase";
import type { TpWordsState } from "../../selectors/tpWords";
import type { SubordinateClause } from "./grammar";
import type { WordId } from "../../selectors/tpWords";
import punctuate from "./punctuate";
import type { EnWord } from "../../selectors/enWords";
import type { Lookup } from "../../actions/lookup";
import { when } from "../../selectors/enWords";

export default async function subordinateClause(
  lookup: Lookup,
  subjects: Array<WordId> = [],
  predicates: Array<WordId> = []
): Promise<SubordinateClause> {
  const { words } = lookup;
  const subjectTranslations = await subjectPhrase(lookup, subjects);
  const predicateTranslations = await predicatePhrase(
    lookup,
    predicates,
    subjects,
    subjectTranslations
  );

  return {
    conjunction: when(),
    subjectPhrase: subjectTranslations,
    predicatePhrase: predicateTranslations,
    endPunctuation: words[predicates[predicates.length - 1]].after || "",
  };
}

export const realizeSubordinateClause = (
  sentence: SubordinateClause
): Array<EnWord> => {
  const { conjunction, subjectPhrase, predicatePhrase, endPunctuation } =
    sentence;
  return punctuate({ after: endPunctuation }, [
    conjunction,
    ...realizeSubjectPhrase(subjectPhrase),
    ...realizePredicatePhrase(predicatePhrase, subjectPhrase),
  ]);
};
