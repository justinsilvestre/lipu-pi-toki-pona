export const SET_HIGHLIGHT_INDEXES = 'SET_HIGHLIGHT_INDEXES'
export const WORD_MOUSE_UP = 'WORD_MOUSE_UP'
export const WORD_MOUSE_DOWN = 'WORD_MOUSE_DOWN'

export const setHighlightIndexes = (highlightedSentenceIndex, highlightedWordIndex) => ({
  type: SET_HIGHLIGHT_INDEXES,
  highlightedSentenceIndex,
  highlightedWordIndex,
})
export const wordMouseDown = () => ({
  type: WORD_MOUSE_DOWN
})
export const wordMouseUp = () => ({
  type: WORD_MOUSE_UP
})

const initialState = {
  highlightedWordIndex: null,
}

// all mouseups over a word occurring after an uncancelled mousedown over a word
// const epic = (action$) => action$.filter(a => a.type === WORD_MOUSE_UP)
export const epic = (action$) => action$.filter(a => a.type === WORD_MOUSE_DOWN).sample(action$.filter(a => a.type === WORD_MOUSE_UP)).map(a => ({ type: 'BOOP' }))

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
