import React, { Component, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import "./App.css";
import Sentence from "./Sentence";
import type { Sentence as SentenceData } from "../selectors/tpSentences";
import type { TpLemmasState } from "../selectors/tpLemmas";
import { parseSentences } from "../actions";
import cn from "classnames";
import { getSentences } from "../selectors";
import type { AppState } from "../selectors";

const lipu_ni = `toki pona li toki lili. jan Sonja li mama pi toki ni.
tan ni la mi pali e lipu ni: mi olin e toki pona!
ken la lipu ni li ken pona e toki sina.
o kama sona e toki pona!
`;

type State = {
  text: string;
  highlightedSentenceIndex?: number | null;
};

export default function App() {
  const [state, setState] = useState<State>({
    text: lipu_ni,
    highlightedSentenceIndex: null,
  });

  const dispatch = useDispatch();

  const handleInputChange = (e): void => {
    setState((state) => ({ ...state, text: e.target.value }));
  };

  const { text } = state;

  const { sentences, tpLemmas, syntaxError } = useSelector(
    (state: AppState) => ({
      sentences: getSentences(state),
      tpLemmas: state.tpLemmas,
      syntaxError: state.notifications.syntaxError,
    })
  );
  const parse = (): void => {
    console.log("dispatched!");
    dispatch(parseSentences(state.text, tpLemmas));
  };

  return (
    <section className="translate">
      <div className="inputContainer">
        <textarea
          spellCheck="false"
          className={cn("input", { syntaxError })}
          value={text}
          onChange={handleInputChange}
        />
        <button className="translateButton" onClick={parse}>
          translate!
        </button>
      </div>
      <section className="output">
        {sentences.map((s, i) => (
          <Sentence tp={s} key={i} index={i} />
        ))}
      </section>
    </section>
  );
}
console.log("rendered!");
