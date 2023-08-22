import nounPhrase, { realizeNounPhrase } from "./nounPhrase";
import adjectivePhrase, { realizeAdjectivePhrase } from "./adjectivePhrase";
import adverbPhrase, { realizeAdverbPhrase } from "./adverbPhrase";
import prepositionalPhrase, {
  realizePrepositionalPhrase,
} from "./prepositionalPhrase";
import conjoin from "./conjoin";
import conjugate from "./conjugate";
import { ANIMATE_SUBJECT_VERBS } from "../tokiPonaSemanticGroups";
import { getPossiblePartsOfSpeech } from "./nounPartsOfSpeech";
import type { EnWord } from "../../selectors/enWords";
import type { WordId } from "../../selectors/tpWords";
import type { TpWordsState } from "../../selectors/tpWords";
import type {
  VerbPhrase,
  SubjectPhrase,
  NounPhrase,
  AdjectivePhrase,
  PrepositionalPhrase,
  SubjectComplementPhrase,
  AdverbPhrase,
} from "./grammar";
import type { Lookup } from "../../actions/lookup";
import { not, by, be } from "../../selectors/enWords";
import type { EnglishPartOfSpeech } from "./grammar";
import { string } from "../alreadyInitializedRita";

// import { realizeSubjectComplement, extractPreposition, getObjects, getSubjectComplement, verbModifiers, verbPhrase, copulaPhrase, realizeVerbPhrase } from './verbPhrase2'
// export { realizeVerbPhrase }
const realizeSubjectComplement = (
  englishTranslation: NounPhrase | AdjectivePhrase | PrepositionalPhrase
): Array<EnWord> => {
  if (englishTranslation.head.pos === "adj") {
    const adjectiveTranslation: AdjectivePhrase = englishTranslation as any;
    return realizeAdjectivePhrase(adjectiveTranslation);
  } else if (
    englishTranslation.head.pos === "n" ||
    englishTranslation.head.pos === "prop"
  ) {
    const nounTranslation: NounPhrase = englishTranslation as any;
    return realizeNounPhrase(nounTranslation);
  } else if (englishTranslation.head.pos === "prep") {
    const prepositionalTranslation: PrepositionalPhrase =
      englishTranslation as any;
    return realizePrepositionalPhrase(prepositionalTranslation);
  } else {
    throw new Error(
      "Subject complement must be noun, adjective, or prepositional phrase: " +
        JSON.stringify(englishTranslation)
    );
  }
};

const getObjects = (words, word): Array<WordId> => {
  switch (word.pos) {
    case "prep":
      if (typeof word.prepositionalObject !== "string")
        throw new Error("whoops");
      return [word.prepositionalObject];
    case "t":
      if (!word.directObjects) throw new Error("whoops");
      return word.directObjects;
    default:
      return [];
  }
};

const extractPreposition = (text: string): string => {
  const [, prepositionText] = text.match(/\((.*)\)/) || [];
  if (!prepositionText) throw new Error("whoops");
  return prepositionText;
};

async function verbPhrase(
  lookup: Lookup,
  wordId: WordId,
  options: {
    subjectPhrase?: SubjectPhrase;
    isInfinitive?: boolean;
    isBareInfinitive?: boolean;
    inanimateSubject?: boolean;
  } = {}
): Promise<VerbPhrase> {
  const { words } = lookup;
  const word = words[wordId];
  let head =
    (await lookup.translate(wordId, ["vt"])).enWord ||
    (await lookup.translate(wordId, ["vi"])).enWord ||
    (await lookup.translate(wordId, ["vm"])).enWord ||
    (await lookup.translate(wordId, ["vc"])).enWord ||
    (await lookup.translate(wordId, ["vp"])).enWord;
  const { subjectPhrase } = options;
  const inanimateSubject =
    subjectPhrase && subjectPhrase.animacy === "INANIMATE";

  head = head || (await lookup.translate(wordId)).enWord;
  if (!head) {
    throw new Error(`No verb translation for ${JSON.stringify(word)}`);
  }

  if (
    (inanimateSubject && ANIMATE_SUBJECT_VERBS.includes(word.text)) || // properly, primary text
    !["vc", "vi", "vt", "vm", "vp"].includes(head.pos)
  ) {
    return await copulaPhrase(lookup, wordId, {
      subjectComplements: [head],
      inanimateSubject,
    });
  } else if (head.pos === "vc") {
    return await copulaPhrase(lookup, wordId, {
      copula: head,
      inanimateSubject,
    });
  }

  // those that are part of head's translation, rather than modifiers'
  const firstPrepositionalPhrases: PrepositionalPhrase[] = await Promise.all(
    head.pos === "vp"
      ? [
          prepositionalPhrase(lookup, wordId, {
            head: { ...head, text: extractPreposition(head.text) },
            objectIds: getObjects(words, word),
          }),
        ]
      : []
  );

  const complements = word.complements || [];
  const {
    adverbPhrases = [],
    prepositionalPhrases: otherPrepositionalPhrases = [],
  } = await verbModifiers(lookup, complements);

  const prepositionalPhrases = firstPrepositionalPhrases.concat(
    otherPrepositionalPhrases
  );

  let result: VerbPhrase = { head, adverbPhrases, prepositionalPhrases };

  if (string(head.text).features().pos === "md") result.isModal = true;

  if (word.directObjects && head.pos === "vt")
    result.directObjects = await Promise.all(
      word.directObjects.map((dos) => nounPhrase(lookup, dos))
    );
  if (word.prepositionalObject && head.pos === "vt")
    result.directObjects = await Promise.all([
      nounPhrase(lookup, word.prepositionalObject),
    ]);
  if (typeof word.infinitive === "string") {
    // const translations = lookUpEnglish(words[word.infinitive])
    // const nominalPos = Object.keys(translations).find(t => t === 'n' || t.startsWith('pn'))
    // if (nominalPos) {
    //   if (typeof word.infinitive !== 'string') throw new Error('whoops')
    //   result.directObjects = (result.directObjects || []).concat(nounPhrase(lookup, word.infinitive))
    // } else {
    if (typeof word.infinitive !== "string") throw new Error("whoops");
    result.infinitive = await verbPhrase(lookup, word.infinitive, {
      [result.isModal ? "isBareInfinitive" : "isInfinitive"]: true,
    });
    // }
  }
  if (options.isInfinitive) {
    result.isInfinitive = true;
  }
  if (options.isBareInfinitive) {
    result.isBareInfinitive = true;
  }
  if (word.negative) {
    result.isNegative = true;
  }

  return result;
}
export default verbPhrase;

async function getSubjectComplement(
  lookup: Lookup,
  sc: WordId,
  options: Object
): Promise<SubjectComplementPhrase> {
  const { words } = lookup;
  const subjectComplement = words[sc];
  if (!subjectComplement) throw new Error(JSON.stringify(sc));
  let getPhrase:
    | typeof nounPhrase
    | typeof adjectivePhrase
    | typeof prepositionalPhrase = nounPhrase;
  const partsOfSpeech: Array<EnglishPartOfSpeech> = [
    "prep",
    "adj",
    ...getPossiblePartsOfSpeech("OBLIQUE", "SINGULAR"), // maybe number should match subjectComplement
  ];
  const head =
    (await lookup.translate(sc, partsOfSpeech)).enWord ||
    (await lookup.translate(sc)).enWord;

  if (!head)
    throw new Error(
      `No subject complement translation for ${JSON.stringify(words[sc])}`
    );

  if (head.pos === "adj") getPhrase = adjectivePhrase;
  if (head.pos === "prep") getPhrase = prepositionalPhrase;

  return await getPhrase(lookup, sc, {
    ...options,
    head,
  });
}
// copula phrases come from predicate nouns, and from tp verb phrases whose head translates to 'vc's.
export async function copulaPhrase(
  lookup: Lookup,
  wordId: WordId,
  options: {
    inanimateSubject?: boolean;
    copula?: EnWord;
    subjectComplements?: any[];
  } = {}
): Promise<VerbPhrase> {
  const { words } = lookup;
  // either wordId is for copula or for subject complements.
  // should throw an error if combination doesn't make sense (leaves something missing)?
  const word = words[wordId];
  const tokiPonaInfinitive = word.infinitive;
  const infinitiveTranslation = tokiPonaInfinitive
    ? (await lookup.translate(tokiPonaInfinitive, ["vt"])).enWord ||
      (await lookup.translate(tokiPonaInfinitive, ["vi"])).enWord ||
      (await lookup.translate(tokiPonaInfinitive, ["vm"])).enWord ||
      (await lookup.translate(tokiPonaInfinitive, ["vc"])).enWord ||
      (await lookup.translate(tokiPonaInfinitive, ["vp"])).enWord
    : null;
  const predicateInfinitive =
    (tokiPonaInfinitive && // does this translate best to a noun?
      options.inanimateSubject &&
      ANIMATE_SUBJECT_VERBS.includes(words[tokiPonaInfinitive].text)) || // properly, primary text
    !["vc", "vi", "vt", "vm", "vp"].some(
      (pos) => pos === (infinitiveTranslation || {}).pos
    );

  const isNegative = word.negative;
  const copula = options.copula || be();
  const subjectComplements: Array<SubjectComplementPhrase> = await Promise.all(
    options.subjectComplements
      ? options.subjectComplements.map((sc) =>
          getSubjectComplement(lookup, wordId, { negatedCopula: isNegative })
        ) // should pass on english translation
      : predicateInfinitive && tokiPonaInfinitive // if the one is there, the other will be
      ? [
          getSubjectComplement(lookup, tokiPonaInfinitive, {
            negatedCopula: isNegative,
          }),
        ]
      : []
  );

  const result: VerbPhrase = {
    head: copula,
    isNegative,
    subjectComplements,
  };
  if (!predicateInfinitive) {
    if (!tokiPonaInfinitive) throw new Error("whoops");
    result.infinitive = await verbPhrase(lookup, tokiPonaInfinitive, {
      isInfinitive: true,
    });
  }
  return result;
}

const flatten = (a, b) => a.concat(b);

export const realizeVerbPhrase = (
  phrase: VerbPhrase,
  subject?: SubjectPhrase
): Array<EnWord> => {
  const {
    isNegative,
    adverbPhrases = [],
    prepositionalPhrases = [],
    subjectComplements = [],
    directObjects = [],
    infinitive,
  } = phrase;
  // should make sure d.o. and subj complement arent both present at once?
  const { mainVerb, auxiliaryVerb } = conjugate(phrase, subject);
  const realizedMainVerb =
    subject || phrase.head.text !== "be" ? [mainVerb] : [];
  return [
    ...(auxiliaryVerb ? [auxiliaryVerb] : realizedMainVerb),
    ...(isNegative ? [not()] : []),
    ...(auxiliaryVerb ? realizedMainVerb : []),
    ...(infinitive ? realizeVerbPhrase(infinitive, subject) : []),
    ...conjoin(directObjects.map(realizeNounPhrase)),
    ...subjectComplements.map(realizeSubjectComplement).reduce(flatten, []),
    ...adverbPhrases.map(realizeAdverbPhrase).reduce(flatten, []),
    ...prepositionalPhrases.map(realizePrepositionalPhrase).reduce(flatten, []),
  ];
};

async function verbModifiers(
  lookup: Lookup,
  complements: Array<WordId>
): Promise<{
  adverbPhrases: AdverbPhrase[];
  prepositionalPhrases: PrepositionalPhrase[];
}> {
  const { words } = lookup;
  const complementsWithEnglish = await Promise.all(
    complements.map(async (c) => {
      const { enWord: english } = await lookup.translate(c, ["adv", "prep"]);
      if (!english)
        throw new Error(
          `No verb modifier translation for ${JSON.stringify(words[c])}`
        );
      return { c, english };
    })
  );
  const { adverbPhrases, prepositionalPhrases } =
    complementsWithEnglish.reduceRight(
      (obj, { c, english }) => {
        const complement = words[c];
        switch (english.pos) {
          case "adv":
            obj.adverbPhrases.push(adverbPhrase(lookup, c));
            // adverb modifiers
            break;
          case "prep":
            if (typeof complement.prepositionalObject !== "string")
              throw new Error("complement needs prepositional object");
            obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(
              prepositionalPhrase(lookup, c, {
                head: english,
                objectIds: [complement.prepositionalObject],
              })
            );
            break;
          case "n":
            obj.prepositionalPhrases = (obj.prepositionalPhrases || []).concat(
              prepositionalPhrase(lookup, c, {
                head: by(),
                objectIds: [c],
              })
            );
            break;
          case "prop":
            //
            break;
          default:
          //   throw new Error(`No viable noun translation for ${words[c].text} (${words[c].pos})`)
        }
        return obj;
      },
      { adverbPhrases: [], prepositionalPhrases: [] } as {
        adverbPhrases: Promise<AdverbPhrase>[];
        prepositionalPhrases: Promise<PrepositionalPhrase>[];
      }
    );

  return {
    adverbPhrases: await Promise.all(adverbPhrases),
    prepositionalPhrases: await Promise.all(prepositionalPhrases),
  };
}
