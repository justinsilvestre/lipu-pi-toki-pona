// @flow

export type EnglishPartOfSpeech =
  'x' // no lexical equivalent
  | 'adv'
  | 'n'
  | 'adj'
  | 'int'
  | 'num'
  | 'prep'
  | 'conj'
  | 'vt' // transitive verb
  | 'vi' // intransitive verb
  | 'vm' // modal verb
  | 'vp' // prepositional verb (not phrasal)
  | 'vc' // copula
  | 'onom'
  | 'd' // determiner
  | 'dp' // plural determiner
  | 'ds' // singular determiner
  | 'pn' // 3rd-person caseless singular pronoun, or pu?/proper noun
  | 'pnp' // caseless plural pronoun
  | 'pnin' // 1st-person nominative singular pronoun
  | 'pnio' // 1st-person oblique singular pronoun
  | 'pnpn' // nominative plural pronoun
  | 'pnpo' // oblique plural pronoun
  | 'pns' // caseless singular pronoun
  | 'pnsn' // 3rd-person nominative singular pronoun
  | 'pnso' // 3rd-person oblique singular pronoun
  | 'pno' // oblique pronoun (cannot be subject, number maybe irrelevant)
  | 'prop'
