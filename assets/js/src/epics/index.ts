import { combineEpics, ofType as ofType_ } from "redux-observable";
import type { Store } from "redux";
import {
  Observable,
  concatMap,
  concatWith,
  filter,
  flatMap,
  fromEvent,
  map,
  mergeMap,
  mergeWith,
  of,
  repeat,
  skipUntil,
  takeUntil,
} from "rxjs";
import type { AppState } from "../selectors";
import {
  selectWords,
  delimitPendingSelection,
  translateSentencesSuccess,
  deselect,
  processTranslationsResponse,
  addPhraseTranslations,
  parseSentencesSuccess,
  parseSentencesFailure,
  updateSentence,
} from "../actions";
import type { Action, RawPhraseTranslations } from "../actions";
import translate from "../utils/translate";
import type { TpWordsState } from "../selectors/tpWords";
import type { WordId } from "../selectors/tpWords";
import lookup from "../actions/lookup";
import {
  wasSelectionMade,
  getSelection,
  getWord,
  getSentenceFromWord,
  getHighlightedWord,
} from "../selectors";
import { pull } from "../utils/channel";
import parseTokiPona from "../utils/parseTokiPona";
import socket from "../utils/socket";
import { realizeSentence } from "../utils/english/sentence";

type AppEpic = import("redux-observable").Epic<
  Action,
  Action,
  AppState,
  { dispatch(): void }
>;
type ActionOf<T> = Action & { type: T };

const ofType = <T extends Action["type"]>(type: T) => {
  return ofType_<Action, T, ActionOf<T>>(type);
};

const sortByIndex = (
  words: TpWordsState,
  word1: WordId,
  word2: WordId
): [WordId, WordId] =>
  [word1, word2].sort((a, b) => {
    if (!words[a] || !words[b]) return 0;
    const i1 = words[a].index;
    const i2 = words[b].index;
    return i1 < i2 ? -1 : 1;
  }) as [WordId, WordId];

type getStateFn = () => AppState;

const multipleWordSelectionEpic: AppEpic = (action$, state$) =>
  action$.pipe(
    ofType("WORD_MOUSE_DOWN"),
    concatMap((mouseDown) =>
      action$.pipe(
        ofType("WORD_MOUSE_ENTER"),
        // mergeWith(
        //   action$.pipe(
        //     ofType<
        //       Action,
        //       "PARSE_SENTENCES_SUCCESS",
        //       ActionOf<"PARSE_SENTENCES_SUCCESS">
        //     >("PARSE_SENTENCES_SUCCESS")
        //   )
        // ),
        takeUntil(
          action$.pipe(
            ofType("WORD_MOUSE_UP"),
            mergeWith(fromEvent(window, "mouseup"))
          )
        ),
        map((mouseEnter) =>
          delimitPendingSelection(
            ...sortByIndex(
              state$.value.tpWords,
              mouseEnter.word,
              mouseDown.word
            )
          )
        ),
        concatWith(of(selectWords()))
      )
    )
  );

const singleWordSelectionEpic: AppEpic = (action$) =>
  action$.pipe(
    ofType("WORD_MOUSE_DOWN"),
    takeUntil(action$.pipe(ofType("WORD_MOUSE_ENTER"))),
    repeat(),
    map((mouseDown) => delimitPendingSelection(mouseDown.word, mouseDown.word)),
    concatWith(of(selectWords()))
  );

const deselectionEpic: AppEpic = (action$, state$) =>
  fromEvent(window, "click").pipe(
    filter(() => !getHighlightedWord(state$.value)),
    map(() => ({ ...deselect(), from: "depci" }))
  );

const parsingEpic: AppEpic = (action$, state$) =>
  action$.pipe(
    ofType("PARSE_SENTENCES"),
    mergeMap(({ text }) => {
      let result;
      try {
        const trimmed = text.trim().replace(/[^\w\s\.\!\?\;\:\,]/g, "");
        const { sentences, words, properNouns } = parseTokiPona(
          trimmed,
          state$.value.tpLemmas
        );
        result = parseSentencesSuccess(sentences, words, properNouns);
      } catch (err) {
        result = parseSentencesFailure();
      }
      return of({ type: "CLEAR_EN_SENTENCES" }, result);
    })
  );

const translationEpic: AppEpic = (action$, state$, { dispatch }) =>
  action$.pipe(
    ofType("PARSE_SENTENCES_SUCCESS"),
    mergeMap(() =>
      translate(
        state$.value.tpSentences,
        state$.value.tpWords,
        lookup(() => state$.value, dispatch)
      ).catch((err) => console.error(err))
    ),
    filter((sentences) => {
      const present = Boolean(sentences);
      return present;
    }),
    map((sentences) =>
      translateSentencesSuccess(sentences!, sentences!.map(realizeSentence))
    )
  );

const phraseTranslationEpic: AppEpic = (action$, state$) =>
  action$.pipe(
    ofType("SELECT_WORDS"),
    filter(() => wasSelectionMade(state$.value)),
    mergeMap(() => {
      const state = state$.value;
      const selectedWord = getSelection(state);
      return selectedWord
        ? pull("look_up_many", { tpLemmaId: selectedWord.lemmaId })
        : Promise.resolve(null);
    }),
    filter((r) => Boolean(r)),
    map((response) => {
      const { enLemmas, phraseTranslations } = processTranslationsResponse(
        response as RawPhraseTranslations
      );
      return addPhraseTranslations(phraseTranslations, enLemmas);
    })
  );

const updateSentenceEpic: AppEpic = (action$, state$, { dispatch }) =>
  action$.pipe(
    ofType("PARSE_SENTENCES_SUCCESS"),
    mergeMap(() =>
      action$.pipe(
        ofType("CHANGE_WORD_TRANSLATION"),
        takeUntil(action$.pipe(ofType("TRANSLATE_SENTENCES"))),
        skipUntil(action$.pipe(ofType("TRANSLATE_SENTENCES_SUCCESS")))
      )
    ),
    mergeMap(async ({ wordId }) => {
      const state = state$.value;
      const { tpSentences, tpWords } = state;
      const sentence = getSentenceFromWord(state, wordId);
      const { index } = sentence;
      try {
        const [newSentence] = await translate(
          [tpSentences[index]],
          tpWords,
          lookup(() => state$.value, dispatch)
        );
        const newWords = realizeSentence(newSentence);

        return updateSentence(index, newSentence, newWords);
      } catch (err) {
        console.error(err);
        return { type: "UPDATE_SENTENCE_FAILURE" as const, err };
      }
    })
  );

const updateSentenceSuccessEpic: AppEpic = (action$) =>
  action$.pipe(
    ofType("UPDATE_SENTENCE"),
    map(() => deselect())
  );

const epic = combineEpics(
  singleWordSelectionEpic,
  multipleWordSelectionEpic,
  deselectionEpic,
  translationEpic,
  phraseTranslationEpic,
  updateSentenceEpic,
  updateSentenceSuccessEpic,
  parsingEpic
);
export default epic;
