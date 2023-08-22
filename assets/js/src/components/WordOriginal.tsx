import React from "react";
import cn from "classnames";
import { connect, useDispatch, useSelector } from "react-redux";
import type { Word, WordId } from "../selectors/tpWords";
import type { Color } from "../utils/getHighlighting";
import type { AppState } from "../selectors";
import {
  getWord,
  isWordHighlighted,
  isWordSelected,
  isWordInPendingSelection,
  getWordColor,
  getTpText,
} from "../selectors";
import {
  wordMouseEnter,
  wordMouseLeave,
  wordMouseDown,
  wordMouseUp,
  wordClick,
} from "../actions";
import TranslationMenu from "./TranslationMenu";

const adjustColor = (
  selecting: boolean,
  selected: boolean,
  [h, s, l]: Color
): Color => [
  h,
  s + (selected || selecting ? 1 : 0) * 60,
  l + (selecting ? 1 : 0) * 20,
];

type WordOriginalOwnProps = {
  originalId: WordId;
};
export default function WordOriginal(props: WordOriginalOwnProps) {
  const { originalId } = props;
  const dispatch = useDispatch();
  const onMouseEnter = () => dispatch(wordMouseEnter(originalId));
  const onMouseLeave = () => dispatch(wordMouseLeave(originalId));
  const onClick = () => dispatch(wordClick(originalId));
  const onMouseUp = () => dispatch(wordMouseUp(originalId));
  const onMouseDown = (e) => {
    dispatch(wordMouseDown(originalId));
    e.preventDefault();
  };

  const { original, color, selecting, selected, highlighted, text } =
    useSelector((state: AppState) => ({
      highlighted: isWordHighlighted(state, originalId),
      color: getWordColor(state, originalId),
      original: getWord(state, originalId),
      selecting: isWordInPendingSelection(state, originalId),
      selected: isWordSelected(state, originalId),
      text: originalId && getTpText(state, originalId),
    }));

  const [h, s, l] = adjustColor(selecting, selected, color);
  const l2 = l + (!selecting && !selected && highlighted ? 20 : 0);
  const style = {
    color: `hsl(${h}, ${s}%, ${l2}%)`,
    fontWeight: original.role.endsWith("PARTICLE") ? 300 : "normal",
  };

  return (
    <span
      className="wordContainer"
      {...{ onMouseEnter, onMouseLeave, onClick, onMouseUp, onMouseDown }}
    >
      <span className={cn("word", { selecting, selected })} style={style}>
        {text}{" "}
      </span>
      {selected && <TranslationMenu />}
    </span>
  );
}
