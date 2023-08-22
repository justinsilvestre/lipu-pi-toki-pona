import nounPhrase, { realizeNounPhrase } from "./nounPhrase";
import {
  ANIMATE_NOUNS,
  INANIMATE_NOUNS,
  ANIMATE_SUBJECT_VERBS,
} from "../tokiPonaSemanticGroups.js";
import type { SubjectPhrase } from "./grammar";
import { getPrimary } from "../dictionary";
import type { TpWordsState } from "../../selectors/tpWords";
import type { WordId } from "../../selectors/tpWords";
import type { Lookup } from "../../actions/lookup";
import { and } from "../../selectors/enWords";

export default async function subjectPhrase(
  lookup: Lookup,
  headIds: Array<WordId>
): Promise<SubjectPhrase> {
  const { words } = lookup;
  if (!headIds.length)
    return {
      // nounPhrases: [{ head: { text: 'it', pos: 'pns' } }],
      nounPhrases: [],
      isPlural: true,
      isFirstPerson: false,
    };

  const nounPhrases = await Promise.all(
    headIds.map((s, i) => {
      // TODO: anu phrases
      // return (i > 0 ? [{ text: 'and', pos: 'conj' }] : []).concat(nounPhrase(lookup, s))
      return nounPhrase(lookup, s, { casus: "NOMINATIVE" });
    })
  );

  const result: SubjectPhrase = {
    nounPhrases,
    isPlural:
      nounPhrases.length > 1 ||
      (nounPhrases[0] && nounPhrases[0].number === "PLURAL") ||
      nounPhrases[0].head.text === "you",
    isFirstPerson: nounPhrases.some((np) =>
      ["I", "we", "me"].includes(np.head.text)
    ),
  };

  headIds.forEach((s) => {
    const text = getPrimary(words[s].text);
    if (
      result.animacy !== "INANIMATE" &&
      (INANIMATE_NOUNS.includes(text) || ANIMATE_SUBJECT_VERBS.includes(text))
    ) {
      result.animacy = "INANIMATE";
    } else if (!result.animacy && ANIMATE_NOUNS.includes(text)) {
      result.animacy = "ANIMATE";
    }
  });

  return result;
}

export function realizeSubjectPhrase(subjectPhrase?: SubjectPhrase) {
  return subjectPhrase
    ? subjectPhrase.nounPhrases.reduce((realized, nounPhrase, i) => {
        if (i > 0)
          return realized.concat([and(), ...realizeNounPhrase(nounPhrase)]);
        else return realized.concat(realizeNounPhrase(nounPhrase));

        // return realized.concat(i > 0 ? [{ text: 'and', pos: 'conj' }, ...realizeNounPhrase(nounPhrase)] : realizeNounPhrase(nounPhrase))
      }, [])
    : [];
}
