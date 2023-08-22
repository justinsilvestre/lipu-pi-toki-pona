import predicatePhrase, { realizePredicatePhrase } from "./predicatePhrase";
import subjectPhrase, { realizeSubjectPhrase } from "./subjectPhrase";
import vocativePhrase, { realizeVocativePhrase } from "./vocativePhrase";
import type { TpWordsState } from "../../selectors/tpWords";
import type { Sentence, SentenceContext } from "../../selectors/tpSentences";
import type { SentenceTranslation } from "./grammar";
import punctuate from "./punctuate";
import type { EnWord } from "../../selectors/enWords";
import subordinateClause, {
  realizeSubordinateClause,
} from "./subordinateClause";
import adverbPhrase, { realizeAdverbPhrase } from "./adverbPhrase";
import prepositionalPhrase, {
  realizePrepositionalPhrase,
} from "./prepositionalPhrase";
import type { Lookup } from "../../actions/lookup";
import { and, by } from "../../selectors/enWords";

export default async function sentence(
  lookup: Lookup,
  tokiPonaSentence: Sentence
): Promise<SentenceTranslation> {
  const { words } = lookup;

  const {
    predicates,
    mood,
    subjects = [],
    vocative,
    contexts = [],
    seme = [],
    words: sentenceWords,
  } = tokiPonaSentence;
  const vocativeTranslation = await (vocative
    ? vocativePhrase(lookup, vocative)
    : Promise.resolve(null));
  const subjectTranslations = subjects.length
    ? await subjectPhrase(lookup, subjects)
    : null;
  const predicateTranslations = await predicatePhrase(
    lookup,
    predicates,
    subjects,
    subjectTranslations
  );
  const { adverbPhrases, prepositionalPhrases, subordinateClauses } =
    await sentenceModifiers(lookup, contexts);

  return {
    ...(vocativeTranslation && { vocative: vocativeTranslation }),
    adverbPhrases,
    prepositionalPhrases,
    subordinateClauses,
    subjectPhrase: subjectTranslations,
    predicatePhrase: predicateTranslations,
    endPunctuation: words[sentenceWords[sentenceWords.length - 1]].after || "",
  };
}

async function sentenceModifiers(
  lookup,
  contexts: Array<SentenceContext>
): Promise<Object> {
  const { words } = lookup;
  const { clauses, phrases } = contexts.reduceRight(
    (accumulator, c) => {
      accumulator[c.subjects ? "clauses" : "phrases"].push(c);
      return accumulator;
    },
    { clauses: [], phrases: [] }
  );
  const phrasesWithEnglish = await Promise.all(
    phrases.map(async (c) => {
      const predicateId = c.predicates[0]; // should only be one--otherwise, throw error?
      const predicate = words[predicateId];

      const { enWord: english } =
        (await lookup.translate(predicateId, ["adv", "n", "prep"])) ||
        (await lookup.translate(predicateId));
      return { english, c: predicateId };
    })
  );
  const { adverbPhrases, prepositionalPhrases } = phrasesWithEnglish.reduce(
    (obj, { c, english }) => {
      if (!english) {
        console.log("NO english");
        return obj;
      }

      if (english.pos === "adv") {
        obj.adverbPhrases.push(adverbPhrase(lookup, c));
      } else if (english.pos === "prep") {
        obj.prepositionalPhrases.push(
          prepositionalPhrase(lookup, c, { head: english })
        );
      } else if (english.pos === "n" || english.pos.startsWith("pn")) {
        obj.prepositionalPhrases.push(
          prepositionalPhrase(lookup, c, {
            head: by(),
            objectIds: [c],
          })
        );
      } // else throw error?
      return obj;
    },
    { adverbPhrases: [], prepositionalPhrases: [] }
  );
  return {
    adverbPhrases: await Promise.all(adverbPhrases),
    prepositionalPhrases: await Promise.all(prepositionalPhrases),
    subordinateClauses: await Promise.all(
      clauses.map((c) => subordinateClause(lookup, c.subjects, c.predicates))
    ),
  };
}

export const realizeSentence = (
  sentence: SentenceTranslation
): Array<EnWord> => {
  const {
    vocative,
    adverbPhrases = [],
    prepositionalPhrases = [],
    subordinateClauses = [],
    subjectPhrase,
    predicatePhrase,
    endPunctuation,
  } = sentence;
  return punctuate({ after: endPunctuation }, [
    ...(vocative ? realizeVocativePhrase(vocative) : []),
    ...adverbPhrases.map(realizeAdverbPhrase).reduce((a, b) => a.concat(b), []),
    ...prepositionalPhrases
      .map(realizePrepositionalPhrase)
      .reduce((a, b) => a.concat(b), []),
    ...subordinateClauses
      .map((sc, i) =>
        i > 0
          ? [and(), ...realizeSubordinateClause(sc)]
          : realizeSubordinateClause(sc)
      )
      .reduce((a, b) => a.concat(b), []),
    ...realizeSubjectPhrase(subjectPhrase),
    ...realizePredicatePhrase(predicatePhrase, subjectPhrase),
  ]);
};
