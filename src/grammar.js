// @flow

const id = (v) => v

export const getText = (word: object | string) => {
  const { text, before, after } = word
  return text ? [before, text, after].filter(id).join('') : word
}

export const getKey = (word: object | string) => {
  const { text } = word
  return text || word
}

const partsOfSpeech = {
  
}
