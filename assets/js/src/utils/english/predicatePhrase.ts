import verbPhrase, { copulaPhrase, realizeVerbPhrase } from "./verbPhrase";
import { and } from "../../selectors/enWords";
import type { TpWordsState, WordId } from "../../selectors/tpWords";
import type { SubjectPhrase, VerbPhrase, PredicatePhrase } from "./grammar";
import type { Lookup } from "../../actions/lookup";

const complementPartsOfSpeech = [
  "adj",
  "n",
  "pn",
  "pnp",
  "pnin",
  "pnio",
  "pnpn",
  "pnpo",
  "pns",
  "pnsn",
  "pnso",
  "pno",
];

// should be able to shorten this function signature
export default async function predicatePhrase(
  lookup: Lookup,
  headIds: Array<WordId>,
  tokiPonaSubjectIds: Array<WordId>,
  englishSubjectPhrase?: SubjectPhrase
): Promise<PredicatePhrase> {
  const { words } = lookup;
  // if subj is animate and pred is animate-subj-verb, translate predicate head to verb.
  // if subj is inanimate and pred is animate-subj-verb, translate predicate head to noun, use copula.

  // const getPhrase = englishSubjectPhrase.animacy === 'INANIMATE' ? (w, p, t) => copulaPhrase(w, p, t) : verbPhrase
  const phrases = await Promise.all(
    headIds.map((p) => {
      return verbPhrase(lookup, p, { subjectPhrase: englishSubjectPhrase });
    })
  );

  return { phrases };
}

export function realizePredicatePhrase(
  phraseData: PredicatePhrase,
  englishSubjectPhrase: SubjectPhrase
) {
  return phraseData.phrases
    .map((p) => realizeVerbPhrase(p, englishSubjectPhrase))
    .reduce((a, b, i) => {
      if (i > 0) return a.concat([and(), ...b]);
      else return a.concat(b);
    }, []);
}
