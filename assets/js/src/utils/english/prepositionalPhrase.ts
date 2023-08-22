import type { TpWordsState } from "../../selectors/tpWords";
import type { WordId, Word } from "../../selectors/tpWords";
import type { EnWord } from "../../selectors/enWords";
import type { PrepositionalPhrase } from "./grammar";
import nounPhrase, { realizeNounPhrase } from "./nounPhrase";
import conjoin from "./conjoin";
import type { Lookup } from "../../actions/lookup";

export default async function prepositionalPhrase(
  lookup: Lookup,
  wordId: WordId,
  options: Object = {}
): Promise<PrepositionalPhrase> {
  const { words } = lookup;
  const word = words[wordId];
  const head =
    options.head || (await lookup.translate(wordId, ["prep"])).enWord;
  if (!head)
    throw new Error(`No preposition translation for ${JSON.stringify(head)}`);

  let objectIds: Array<WordId> = options.objectIds;
  if (!options.objectIds) {
    if (typeof word.prepositionalObject !== "string") throw new Error("whoops");
    objectIds = [word.prepositionalObject];
  }

  return {
    head,
    objects: await Promise.all(
      objectIds.map((objectId) => nounPhrase(lookup, objectId))
    ),
    // isNegative: preposition
  };
}

export function realizePrepositionalPhrase(
  phrase: PrepositionalPhrase
): Array<EnWord> {
  const { head, objects } = phrase;
  return [head, ...conjoin(objects.map((object) => realizeNounPhrase(object)))];
}
