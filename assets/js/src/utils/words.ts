import type { WordId, TpWordsState } from "../selectors/tpWords";
import {
  isComplement,
  isPredicate,
  isSubject,
  isContextPredicate,
} from "./tokiPonaRoleQueries";

type WordRelationQuery = (
  words: TpWordsState,
  word1: WordId,
  word2: WordId
) => boolean;

export const isComplementOf: WordRelationQuery = (words, head, word) =>
  isComplement(words[word]) && words[word].head === head;
export const isDirectObjectOf: WordRelationQuery = (
  words,
  maybeTransitiveVerb,
  maybeDO
) => {
  const { directObjects } = words[maybeTransitiveVerb];
  return Boolean(directObjects && directObjects.includes(maybeDO));
};
export const isInfinitiveOf: WordRelationQuery = (
  words,
  maybePredicate,
  maybeInfinitive
): boolean => words[maybePredicate].infinitive === maybeInfinitive;
export const isPrepositionalObjectOf: WordRelationQuery = (
  words,
  maybePreposition,
  maybePO
) => words[maybePreposition].prepositionalObject === maybePO;
export const isSubjectOf: WordRelationQuery = (
  words,
  maybePredicate,
  maybeSubject
) => {
  const { sentence: pSentence, context: pContext } = words[maybePredicate];
  const { sentence: sSentence, context: sContext } = words[maybeSubject];

  return (
    pSentence === sSentence &&
    ((isPredicate(words[maybePredicate]) && isSubject(words[maybeSubject])) ||
      Boolean(pContext && pContext === sContext))
  );
};
export const isContextOf: WordRelationQuery = (
  words,
  maybePredicate,
  maybeContext
) =>
  // will only work in same sentence
  isPredicate(words[maybePredicate]) && isContextPredicate(words[maybeContext]);

type IsChildOf = (words: TpWordsState, parent: WordId, word: WordId) => boolean;
export const isChildOf: IsChildOf = (words, parent, word) =>
  isComplementOf(words, parent, word) ||
  isDirectObjectOf(words, parent, word) ||
  isInfinitiveOf(words, parent, word) ||
  isPrepositionalObjectOf(words, parent, word) ||
  isSubjectOf(words, parent, word) ||
  isContextOf(words, parent, word);
// type GetChildren = (words: TpWordsState, parentSentence: Array<WordId>, parent: WordId) => Array<WordId>
type GetChildren = (words: TpWordsState, parent: WordId) => Array<WordId>;
export const children: GetChildren = (words, parent) => {
  // switch(words[parent].role) {
  //   case ''
  // }
  const parentData = words[parent];
  const directObjects = parentData.directObjects || [];
  const infinitive = parentData.infinitive || [];
  const prepositionalObject = parentData.prepositionalObject || [];
  // const prepositionalObject = []
  const complements = parentData.complements || [];
  return [...directObjects, ...complements].concat(
    infinitive,
    prepositionalObject
  );
};
type IsDescendantOf = (
  words: TpWordsState,
  ancestor: WordId,
  word: WordId
) => boolean;

export const isDescendantOf: IsDescendantOf = (words, ancestor, word) =>
  isChildOf(words, ancestor, word) ||
  children(words, ancestor).some((child) => isDescendantOf(words, word, child));
