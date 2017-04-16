// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux'
import './App.css';
import Sentence from './Sentence'
import TranslationMenu from './TranslationMenu'
import type { Sentence as SentenceData } from '../utils/grammar'
import type { TpLemmasState } from '../reducers/tpLemmas' 
import { parseSentences } from '../actions'
import { getSentences } from '../reducers'

// sina kepeken toki pona la jan li pilin pona.
const lipu_ni = `jan mute o, toki pona li toki lili.
jan Sonja li mama pi toki ni.
jan Jatin li pali e lipu ni.
sina toki pona la jan li pilin pona.
o lukin e lipu ni o kama sona e toki pona!
jan ale li ken lukin e lipu mute li ken pali e lipu sin a!`
window.lipu_ni = lipu_ni

type AppProps = {
  sentences: Array<SentenceData>,
  parseSentences: Function,
  tpLemmas: TpLemmasState,
}
type AppState = {
  text: string,
  highlightedSentenceIndex: ?number,
}
export class App extends Component {
  props : AppProps
  state : AppState = {
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
    const { sentences } = this.props

    return (
      <div>
        <textarea value={text} onChange={this.handleInputChange} ref={(e) => this.textarea = e} />
        <button onClick={this.parse}>hi!</button>
        <br />
        <TranslationMenu />
        <section>
        {sentences.map((s, i) => <Sentence tp={s} key={i} index={i}/>)}
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  sentences: getSentences(state),
  tpLemmas: state.tpLemmas,
})
const mapDispatchToProps = { parseSentences }

export default connect(mapStateToProps, mapDispatchToProps)(App)
