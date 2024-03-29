import prepositionalPhrase, {
  realizePrepositionalPhrase,
} from "./prepositionalPhrase";
import type { AdverbPhrase } from "./grammar";
import type { TpWordsState } from "../../selectors/tpWords";
import type { WordId } from "../../selectors/tpWords";
import type { EnWord } from "../../selectors/enWords";
import type { Lookup } from "../../actions/lookup";
import { not } from "../../selectors/enWords";

export default async function adverbPhrase(
  lookup: Lookup,
  wordId: WordId
): Promise<AdverbPhrase> {
  const { words } = lookup;
  const word = words[wordId];
  const { enWord: head } = await lookup.translate(wordId, ["adv"]);
  if (!head)
    throw new Error(`No adverb translation found for ${JSON.stringify(word)}`);

  const complements = word.complements || [];
  const { prepositionalPhrases, adverbPhrases } =
    (await adverbModifiers(lookup, complements)) || {};
  const isNegative = Boolean(word.negative);

  return { head, prepositionalPhrases, adverbPhrases, isNegative };
}

async function adverbModifiers(
  lookup: Lookup,
  complements: Array<WordId>
): Promise<Object> {
  const { words } = lookup;
  const complementsWithEnglish = await Promise.all(
    complements.map(async (c) => {
      const { enWord: english } = await lookup.translate(c, ["adv", "prep"]);
      if (!english)
        throw new Error(
          `No adverb modifier translation found for ${JSON.stringify(words[c])}`
        );
      return { c, english };
    })
  );
  const { prepositionalPhrases = [], adverbPhrases = [] } =
    complementsWithEnglish.reduceRight((obj, { c, english }) => {
      const complement = words[c];
      switch (english.pos) {
        case "adv":
          obj.adverbPhrases = (obj.adverbPhrases || []).concat(english);
          // adverb modifiers
          break;
        case "prep":
          if (typeof complement.prepositionalObject === "string") {
            // obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(lookup, english, [complement.prepositionalObject]))
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
          // obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(prepositionalPhrase(lookup, { text: 'of', pos: 'prep' }, [c]))
          obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(
            prepositionalPhrase(lookup, c, {
              head: { text: "of", pos: "prep" },
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
    }, {});
  return {
    prepositionalPhrases: await Promise.all(prepositionalPhrases),
    adverbPhrases: await Promise.all(adverbPhrases),
  };
}

export const realizeAdverbPhrase = ({
  head,
  prepositionalPhrases = [],
  adverbPhrases = [],
  isNegative,
}: AdverbPhrase): Array<EnWord> => [
  ...adverbPhrases.map(realizeAdverbPhrase).reduce((a, b) => a.concat(b), []),
  ...(isNegative ? [not()] : []),
  head,
  ...prepositionalPhrases
    .map(realizePrepositionalPhrase)
    .reduce((a, b) => a.concat(b), []),
];
