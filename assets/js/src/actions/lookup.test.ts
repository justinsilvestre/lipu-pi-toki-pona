// import type { Lookup } from './lookup'
let mockedUuids = [];
const mockUuids = (id, ...ids) => {
  mockedUuids = [id, ...ids];
};

let mockedUuid = null;
jest.mock(
  "uuid",
  () =>
    // () => mockedUuid
    () =>
      console.log(mockedUuids) || mockedUuids.shift()
);
const mockUuid = (id) => (mockedUuid = id);

let mockedFetchTranslation;
jest.mock("./fetchTranslation", () => mockedFetchTranslation);
const mockFetchTranslation = (fn) => (mockedFetchTranslation = fn);

import type { WordId, Word } from "../selectors/tpWords";
import { newWord } from "../selectors/tpWords";
// import type { EnglishPartOfSpeech } from '../utils/english/grammar'
// import type { PhraseTranslation, State as PhraseTranslationState } from '../selectors/phraseTranslations'
// import type { EnLemma, EnLemmasState } from '../selectors/enLemmas'
import lookup, { addPhraseTranslation } from "./lookup";

const baseMockSelectors = {
  getTpWords: () => ({}),
  getTpLemmas: () => ({}),
};
let mockedSelectors = { ...baseMockSelectors };

jest.mock(
  "../selectors",
  () =>
    new Proxy(
      {},
      {
        get(target, key) {
          return mockedSelectors[key];
        },
      }
    )
);

const mockSelectors = (obj) => {
  Object.assign(mockedSelectors, baseMockSelectors, obj);
};
const unmockSelectorsAndUuids = () => {
  mockedSelectors = {};
  mockedUuids = [];
};

describe("lookup object", () => {
  const getState = () => {};
  const dispatch = jest.fn();

  afterEach(unmockSelectorsAndUuids);

  it("gets a word with already fetched translation", async () => {
    const selectors = {
      getWord: () => ({ lemmaId: 123 }),
      isNewProperNoun: () => false,
      getEnWordFromTp: () => ({ id: "booboo" }), // not being used?
      lookUpTranslation: () => ({ id: "phraseTranslationId" }),
      getEnLemma: () => ({
        pos: "int",
        text: "hello",
        tpWordId: "tpWordId",
      }),
    };
    mockUuids("enWordId");
    mockSelectors(selectors);

    const { translate } = lookup(getState, dispatch);
    const translation = await translate("tpWordId");

    expect(translation).toEqual({
      enLemma: selectors.getEnLemma(),
      enWord: {
        id: "enWordId",
        text: "hello",
        pos: "int",
        tpWordId: "tpWordId",
        phraseTranslationId: "phraseTranslationId",
      },
      phraseTranslation: selectors.lookUpTranslation(),
    });
  });

  it("gets a word without any fetched translations", async () => {
    const selectors = {
      getWord: () => ({ lemmaId: 123 }),
      isNewProperNoun: () => false,
      lookUpTranslation: () => null,
    };
    mockFetchTranslation(() => ({
      enLemma: null,
      phraseTranslation: null,
    }));

    const dispatch = jest.fn();
    const { translate } = lookup(getState, dispatch);
    const translation = await translate("tpWordId");

    expect(translation).toEqual({});
    expect(dispatch).toHaveBeenCalledWith(
      addPhraseTranslation(null, null, null)
    );
  });

  it("gets a word without valid fetched translation");

  it("gets new proper noun", async () => {
    mockUuids("enWordId");
    mockSelectors({
      getWord: () => newWord("Mewika", "mewikaId"),
      isNewProperNoun: () => true,
    });

    const { translate } = lookup(getState, dispatch);
    const translation = await translate("Mewika");

    expect(translation).toEqual({
      phraseTranslation: null,
      enLemma: null,
      enWord: {
        id: "enWordId",
        pos: "prop",
        text: "Mewika",
        tpWordId: "Mewika",
      },
    });
  });
});

// const translate = (wordId: WordId, enPartsOfSpeech?: Array<EnglishPartOfSpeech>) =>
//   Promise.resolve({
//     enLemma: null,
//     phraseTranslation: null,
//     enWord: null,
//   })
//  // Promise<{
//  //    enLemma?: EnLemma,
//  //    phraseTranslation?: PhraseTranslation,
//  //    enWord?: EnWord,
//  //  }>,
//
// const lookup : Lookup = {
//   words: {},
//   tpLemmas: {},
//   translate,
// }
