// @flow
import RiTa, { SINGULAR, PLURAL, FIRST_PERSON, THIRD_PERSON, string } from '../rita'
import type { WordTranslation } from '../dictionary'
import type { VerbPhrase, SubjectPhrase } from './grammar'

const conjugate = (verbPhrase: VerbPhrase, subject?: SubjectPhrase, externalAuxiliaryVerb: ?WordTranslation) => {
  const verb = verbPhrase.head
  const auxiliaryVerb = externalAuxiliaryVerb || (
    verb.text !== 'be' && verbPhrase.isNegative && !(verbPhrase.isInfinitive || verbPhrase.isBareInfinitive)
    ? { text: 'do', pos: 'v' }
    : undefined
  )
  console.log('conjugating', verb)
  const { isPlural, isFirstPerson } = subject || {}
  const rules = {
    number: isPlural ? PLURAL : SINGULAR,
    person: isFirstPerson ? FIRST_PERSON : THIRD_PERSON,
  }
  // console.log(verb.text, string(subject && subject.head && subject.head.text).features())
  let newText = auxiliaryVerb || verbPhrase.isBareInfinitive || verbPhrase.isModal
    ? verb.text
    : RiTa.conjugate(verb.text, rules)
    console.log(newText)
  if (verbPhrase.isInfinitive) newText = `to ${verb.text}`

  const result = {
    mainVerb: {
      ...verb,
      text: newText,
      root: verb.text,
    }
  }
  if (auxiliaryVerb) result.auxiliaryVerb = {
    text: RiTa.conjugate(auxiliaryVerb.text, rules),
    root: auxiliaryVerb.text,
  }

  if (verbPhrase.head.text.includes('know')) console.log(verbPhrase.head.text, result, verbPhrase)
  console.log(verbPhrase.head.text, result, verbPhrase)
  return result
}

export default conjugate
