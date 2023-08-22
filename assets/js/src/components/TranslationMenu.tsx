import React from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import type { AppState } from "../selectors";
import type { SentenceTranslation as SentenceTranslationType } from "../utils/english/grammar";
import { realizeSentence } from "../utils/english/sentence";
import {
  wasSelectionMade,
  getSelection,
  lookUpTranslations,
  getEnLemmaText,
} from "../selectors";
import { changeWordTranslation } from "../actions/lookup";
import TranslationMenuOption from "./TranslationMenuOption";

const TranslationMenu = () => {
  const { englishTranslations, selectedWordId } = useSelector(
    (state: AppState) => {
      const word = getSelection(state);
      if (!word) throw new Error("quiet flow");
      return {
        selectedWordId: word.id,
        text: word.text,
        englishTranslations: lookUpTranslations(state, word.lemmaId),
      };
    }
  );
  const dispatch = useDispatch();

  return (
    <div className="translationMenu">
      <ul className="translationMenuLemmaOptions">
        {englishTranslations.map((t) => (
          <TranslationMenuOption
            key={t.id}
            phraseTranslation={t}
            changeWordTranslation={(wordId, phraseTranslationId) =>
              dispatch(changeWordTranslation(wordId, phraseTranslationId))
            }
            selectedWordId={selectedWordId}
          />
        ))}
      </ul>
    </div>
  );
};

export default TranslationMenu;
