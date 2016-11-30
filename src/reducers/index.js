export const SET_HIGHLIGHT_INDEXES = 'SET_HIGHLIGHT_INDEXES'

export const setHighlightIndexes = (highlightedSentenceIndex, highlightedWordIndex) => ({
  type: SET_HIGHLIGHT_INDEXES,
  highlightedSentenceIndex,
  highlightedWordIndex,
})

const initialState = {
  highlightedWordIndex: null,
}

export default function app(state = initialState, action) {
  switch(action.type) {
    case SET_HIGHLIGHT_INDEXES:
      return {
        ...state,
        highlightedSentenceIndex: action.highlightedSentenceIndex,
        highlightedWordIndex: action.highlightedWordIndex,
      }
    default:
      return state
  }
}
