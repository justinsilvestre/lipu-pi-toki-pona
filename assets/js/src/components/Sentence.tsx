import React, { Component } from "react";
import { connect, useSelector } from "react-redux";
import SentenceOriginal from "./SentenceOriginal";
import SentenceTranslation from "./SentenceTranslation";
import type { Sentence } from "../selectors/tpSentences";
import type { SentenceTranslation as SentenceTranslationType } from "../utils/english/grammar";
import { AppState, getEnSentence } from "../selectors";

type SentenceProps = {
  tp: Sentence;
  index: number;
};
export default function SentencePair(props: SentenceProps) {
  const { tp, index: sentenceIndex } = props;
  const en = useSelector((state: AppState) =>
    getEnSentence(state, sentenceIndex)
  );
  return (
    <div className="sentenceContainer">
      <SentenceOriginal sentenceData={tp} index={sentenceIndex} />
      {en && <SentenceTranslation sentenceData={en} />}
    </div>
  );
}
