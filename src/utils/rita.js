import 'rita'

const RiTa = window.RiTa


module.exports = RiTa

module.exports.string = window.RiString
module.exports.grammar = window.RiGrammar
module.exports.markov = window.RiMarkov
module.exports.wordnet = window.RiWordNet
module.exports.lexicon = new window.RiLexicon()
module.exports.event = window.RiTaEvent
