import { describe, it, expect, vi } from "vitest";
import type { Word } from "../selectors/tpWords";
import { newWord } from "../selectors/tpWords";
import lookup, { addPhraseTranslation } from "./lookup";
import { PhraseTranslation } from "../selectors/phraseTranslations";
import { EnLemma } from "../selectors/enLemmas";
import { EnWord } from "../selectors/enWords";
import { ProcessedTranslationResponse } from "./fetchTranslation";

describe("lookup object", () => {
  it("gets a word with already fetched translation", async () => {
    const dispatch = vi.fn();
    const fakeEnLemma = {
      pos: "int",
      text: "hello",
      tpWordId: "tpWordId",
    } as unknown as EnLemma;
    const fakeTranslation = {
      id: 987,
    } as unknown as PhraseTranslation;
    const { translate } = lookup({
      selectors: {
        getWord: () =>
          ({ lemmaId: 123, text: "toki", id: "tpWordId" } as unknown as Word),
        isNewProperNoun: () => false,
        lookUpTranslation: () => fakeTranslation,
        getEnLemma: () => fakeEnLemma,
        getTpLemmas: () => ({}),
        getTpWords: () => ({}),
        lookUpTranslationId: () => 987,
      },
      dispatch,
      uuidV4: () => "enWordId",
    });
    const translation = await translate("tpWordId");

    expect(translation).toEqual({
      enLemma: fakeEnLemma,
      enWord: {
        id: "enWordId",
        text: "hello",
        pos: "int",
        tpWordId: "tpWordId",
        phraseTranslationId: 987,
      },
      phraseTranslation: fakeTranslation,
    });
  });

  it("gets a word without any fetched translations", async () => {
    const dispatch = vi.fn();

    const fakePhraseTranslation: PhraseTranslation = {
      id: 456,
    } as unknown as any;
    const fakeEnWord: EnWord = { id: "fakeEnWord" } as unknown as any;
    const fakeEnLemma = {
      pos: "int",
      text: "hello",
      tpWordId: "tpWordId",
    } as unknown as EnLemma;

    const { translate } = lookup({
      selectors: {
        getWord: () => ({ lemmaId: 123 } as unknown as Word),
        isNewProperNoun: () => false,
        lookUpTranslation: () => null,
        getEnLemma: () => fakeEnLemma,
        getTpLemmas: () => ({}),
        getTpWords: () => ({}),
        lookUpTranslationId: () => 987,
      },
      dispatch,
      uuidV4: () => "fakeEnWord",
      fetchTranslation: async () =>
        ({
          enLemma: fakeEnLemma,
          phraseTranslation: fakePhraseTranslation,
        } as ProcessedTranslationResponse),
    });
    const translation = await translate("tpWordId");

    expect(translation).toEqual({
      enLemma: fakeEnLemma,
      enWord: {
        ...fakeEnLemma,
        ...fakeEnWord,
        phraseTranslationId: 456,
      },
      phraseTranslation: fakePhraseTranslation,
    });
    expect(dispatch).toHaveBeenCalledWith(
      addPhraseTranslation(fakePhraseTranslation, fakeEnLemma, {
        ...fakeEnLemma,
        ...fakeEnWord,
        phraseTranslationId: 456,
      })
    );
  });

  it("gets a word without valid fetched translation");

  it("gets new proper noun", async () => {
    const dispatch = vi.fn();
    const fakeEnLemma = {
      pos: "int",
      text: "hello",
      tpWordId: "tpWordId",
    } as unknown as EnLemma;
    const fakePhraseTranslation = {
      id: "phraseTranslationId",
    } as unknown as PhraseTranslation;
    const { translate } = lookup({
      selectors: {
        getWord: () => newWord("Mewika", "mewikaId") as unknown as Word,
        isNewProperNoun: () => true,
        lookUpTranslation: () => null,
        getEnLemma: () => fakeEnLemma,
        getTpLemmas: () => ({}),
        getTpWords: () => ({}),
        lookUpTranslationId: () => 987,
      },
      dispatch,
      uuidV4: () => "enWordId",
      fetchTranslation: async () =>
        ({
          enLemma: fakeEnLemma,
          phraseTranslation: fakePhraseTranslation,
        } as ProcessedTranslationResponse),
    });
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
