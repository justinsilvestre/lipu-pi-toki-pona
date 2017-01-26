// @flow
import {
  VOCATIVE,
  PREDICATE,
  COMPLEMENT,
  SUBJECT,
  INFINITIVE,
  DIRECT_OBJECT,
  PREPOSITIONAL_OBJECT,
  NEGATIVE,
  INTERROGATIVE,
  INTERROGATIVE_REPETITION,
  VOCATIVE_PARTICLE,
  INDICATIVE_PARTICLE,
  OPTATIVE_PARTICLE,
  DIRECT_OBJECT_PARTICLE,
  COMPOUND_COMPLEMENT_PARTICLE,
  AND_PARTICLE,
  OR_PARTICLE,
  CONTEXT_PARTICLE,
  CONTEXT_PREDICATE,
  CONTEXT_SUBJECT,
} from './tokiPonaRoles'

type RoleQuery = (word: Word) => boolean
export const isVocative : RoleQuery = (word) => word.role === VOCATIVE
export const isPredicate : RoleQuery = (word) => word.role === PREDICATE
export const isComplement : RoleQuery = (word) => word.role === COMPLEMENT
export const isSubject : RoleQuery = (word) => word.role === SUBJECT
export const isInfinitive : RoleQuery = (word) => word.role === INFINITIVE
export const isDirectObject : RoleQuery = (word) => word.role === DIRECT_OBJECT
export const isPrepositionalObject : RoleQuery = (word) => word.role === PREPOSITIONAL_OBJECT
export const isNegative : RoleQuery = (word) => word.role === NEGATIVE
export const isInterrogative : RoleQuery = (word) => word.role === INTERROGATIVE
export const isInterrogativeRepetition : RoleQuery = (word) => word.role === INTERROGATIVE_REPETITION
export const isVocativeParticle : RoleQuery = (word) => word.role === VOCATIVE_PARTICLE
export const isIndicativeParticle : RoleQuery = (word) => word.role === INDICATIVE_PARTICLE
export const isOptativeParticle : RoleQuery = (word) => word.role === OPTATIVE_PARTICLE
export const isDirectobjectParticle : RoleQuery = (word) => word.role === DIRECT_OBJECT_PARTICLE
export const isCompoundcomplementParticle : RoleQuery = (word) => word.role === COMPOUND_COMPLEMENT_PARTICLE
export const isAndParticle : RoleQuery = (word) => word.role === AND_PARTICLE
export const isOrParticle : RoleQuery = (word) => word.role === OR_PARTICLE
export const isContextParticle : RoleQuery = (word) => word.role === CONTEXT_PARTICLE
export const isContextSubject : RoleQuery = (word) => word.role === CONTEXT_SUBJECT
export const isContextPredicate : RoleQuery = (word) => word.role === CONTEXT_PREDICATE
