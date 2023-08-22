import prepositionalPhrase, {
  realizePrepositionalPhrase,
} from "./prepositionalPhrase";
import type {
  AdjectivePhrase,
  AdverbPhrase,
  PrepositionalPhrase,
} from "./grammar";
import type { TpWordsState } from "../../selectors/tpWords";
import type { WordId, Word } from "../../selectors/tpWords";
import adverbPhrase, { realizeAdverbPhrase } from "./adverbPhrase";
import type { EnWord } from "../../selectors/enWords";
import type { Lookup } from "../../actions/lookup";
import { ofWord, not } from "../../selectors/enWords";

export default async function adjectivePhrase(
  lookup: Lookup,
  wordId: WordId,
  options: {
    negatedCopula?: boolean;
    negative?: boolean;
  } = {}
): Promise<AdjectivePhrase> {
  const { words } = lookup;
  const word = words[wordId];
  const { enWord: head } = await lookup.translate(wordId, ["adj"]);
  if (!head)
    throw new Error(
      `No adjective translation found for ${JSON.stringify(word)}`
    );
  const complements = word.complements || [];
  const isNegative = Boolean(!options.negatedCopula && word.negative);
  const { prepositionalPhrases, adverbPhrases } = await adjectiveModifiers(
    lookup,
    complements,
    { isNegative }
  );

  return { head, prepositionalPhrases, adverbPhrases, isNegative };
}

async function adjectiveModifiers(
  lookup: Lookup,
  complements: Array<WordId>,
  options: Object
) {
  const { words } = lookup;
  const obj: {
    prepositionalPhrases: Promise<PrepositionalPhrase>[];
    adverbPhrases: Promise<AdverbPhrase>[];
  } = { prepositionalPhrases: [], adverbPhrases: [] };
  const complementsWithEnglish = await Promise.all(
    complements.map(async (c) => {
      const { enWord: english } = await lookup.translate(c, [
        "adv",
        "prep",
        "n",
      ]);
      if (!english)
        throw new Error(
          `No adjective modifier translation found for ${JSON.stringify(
            words[c]
          )}`
        );
      return { c, english };
    })
  );
  const { prepositionalPhrases, adverbPhrases } =
    complementsWithEnglish.reduceRight((obj, { c, english }) => {
      const complement = words[c];
      switch (english.pos) {
        case "adv":
          obj.adverbPhrases = (obj.adverbPhrases || []).concat(
            adverbPhrase(lookup, c)
          );
          // adverb modifiers
          break;
        case "prep":
          if (typeof complement.prepositionalObject === "string") {
            obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(
              prepositionalPhrase(lookup, c, {
                head: english,
                objectIds: [complement.prepositionalObject],
              })
            );
          } else {
            throw new Error("complement needs prepositional object");
          }
          break;
        case "n":
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(
            prepositionalPhrase(lookup, c, {
              head: ofWord(),
              objectIds: [c],
            })
          );
          break;
        case "prop":
        case "vi":
          //
          break;
        // case ''
        default:
        //   throw new Error(`No viable noun translation for ${words[c].text} (${words[c].pos})`)
      }
      return obj;
    }, obj);
  return {
    prepositionalPhrases: await Promise.all(prepositionalPhrases),
    adverbPhrases: await Promise.all(adverbPhrases),
  };
}

export const realizeAdjectivePhrase = ({
  head,
  prepositionalPhrases = [],
  adverbPhrases = [],
  isNegative,
}: AdjectivePhrase): Array<EnWord> => [
  ...adverbPhrases.map(realizeAdverbPhrase).reduce((a, b) => a.concat(b), []),
  ...(isNegative ? [not()] : []),
  head,
  ...prepositionalPhrases
    .map((pp) => realizePrepositionalPhrase(pp))
    .reduce((a, b) => a.concat(b), []),
];
