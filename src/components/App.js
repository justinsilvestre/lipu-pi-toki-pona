// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux'
import './App.css';
import Sentence from './Sentence'
import type { Sentence as SentenceData } from '../selectors/tpSentences'
import type { TpLemmasState } from '../selectors/tpLemmas'
import { parseSentences } from '../actions'
import cn from 'classnames'
import { getSentences } from '../selectors'
import type { AppState } from '../selectors'

const lipu_ni = `toki pona li toki lili. jan Sonja li mama pi toki ni.
tan ni la mi pali e lipu ni: mi olin e toki pona!
ken la lipu ni li ken pona e toki sina.
o kama sona e toki pona!
`

type StateProps = {
  sentences: Array<SentenceData>,
  tpLemmas: TpLemmasState,
  syntaxError: boolean,
}
type DispatchProps = {
  parseSentences: Function,
}
type Props = StateProps & DispatchProps
type State = {
  text: string,
  highlightedSentenceIndex: ?number,
}
export class App extends Component {
  props : Props
  state : State = {
    text: lipu_ni,
    highlightedSentenceIndex: null,
  }
  textarea : HTMLInputElement

  handleInputChange = () : void => {
    this.setState({ text: this.textarea.value })
  }

  parse = () : void => {
    this.props.parseSentences(this.state.text, this.props.tpLemmas)
  }

  render() {
    const { text } = this.state
    const { sentences, syntaxError } = this.props

    return (
      <div className="container">
        <header>
          <h1>lipu pi toki pona
          <br /><small>Read and learn Toki Pona</small></h1>
        </header>
        <main>
          <section className="info">
            <section>
              Toki Pona is a language constructed by <a href="http://tokipona.org">Sonja Lang</a> using a lexicon of just 120 words.
              A thought expressed in Toki Pona is a thought boiled down to its essence.
            </section>
            <section>
              This app is the beginnings of a <strong>crowdsourced phrase
              dictionary</strong>, to be powered by a collection
              of <strong>semi-automatically translated texts</strong>.
              Until then, enjoy some simple word-for-word translations with syntax highlighting.
            </section>
            <section>
              <a href="https://github.com/justinsilvestre/lipu-pi-toki-pona">Built</a> using React, Redux, RxJS, PEG.js, and Phoenix by <a href="http://justinreally.codes/">Justin Silvestre</a>.
            </section>
          </section>
          <section className="translate">
            <div className="inputContainer">
              <textarea spellCheck="false" className={cn('input', { syntaxError })} value={text} onChange={this.handleInputChange} ref={(e) => this.textarea = e} />
              <button className="translateButton" onClick={this.parse}>translate!</button>
            </div>
            <section className="output">
            {sentences.map((s, i) => <Sentence tp={s} key={i} index={i}/>)}
            </section>
          </section>
        </main>
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => ({
  sentences: getSentences(state),
  tpLemmas: state.tpLemmas,
  syntaxError: state.notifications.syntaxError,
})
const mapDispatchToProps: DispatchProps = { parseSentences }

export default connect(mapStateToProps, mapDispatchToProps)(App)
