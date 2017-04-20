// @flow
import RiTa, { SINGULAR, PLURAL, FIRST_PERSON, THIRD_PERSON } from '../rita'
import type { WordTranslation } from '../dictionary'
import type { VerbPhrase, SubjectPhrase } from './grammar'

export type ConjugatedVerbs = {
  mainVerb: WordTranslation,
  auxiliaryVerb?: WordTranslation,
}

const conjugate = (verbPhrase: VerbPhrase, subject?: SubjectPhrase, externalAuxiliaryVerb: ?WordTranslation): ConjugatedVerbs => {
  const verb = verbPhrase.head
  const auxiliaryVerb = externalAuxiliaryVerb || (
    verb.text !== 'be' && verbPhrase.isNegative && !(verbPhrase.isInfinitive || verbPhrase.isBareInfinitive)
    ? { text: 'do', pos: 'vi' }
    : undefined
  )

  const { isPlural, isFirstPerson } = subject || {}
  const rules = {
    number: isPlural || !subject ? PLURAL : SINGULAR,
    person: isFirstPerson ? FIRST_PERSON : THIRD_PERSON,
  }

  let newText = auxiliaryVerb || verbPhrase.isBareInfinitive || verbPhrase.isModal
    ? verb.text
    : RiTa.conjugate(verb.text, rules)
  if (verbPhrase.isInfinitive) newText = `to ${verb.text}`

  const result : ConjugatedVerbs = {
    mainVerb: {
      ...verb,
      text: newText,
      root: verb.text,
    },
  }
  if (auxiliaryVerb) result.auxiliaryVerb = {
    text: RiTa.conjugate(auxiliaryVerb.text, rules),
    root: auxiliaryVerb.text,
    pos: auxiliaryVerb.pos,
  }

  return result
}

export default conjugate
