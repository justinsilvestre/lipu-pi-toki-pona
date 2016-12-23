// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux'
import logo from '../logo.svg';
import './App.css';
import Sentence from './Sentence'
import type { Sentence as SentenceData } from '../utils/grammar'
import { intersperse } from 'ramda'
import { parseSentences } from '../redux/actions'

const lipu_ni = `toki pona li toki lili.
jan Sonja li mama pi toki ni.
kepeken toki pona la jan li pilin pona.
jan Jatin li pali e lipu ni.
o lukin e lipu ni o kama sona e toki pona!
jan ale li ken lukin e lipu mute li ken pali e lipu sin a!`
window.lipu_ni = lipu_ni

type AppProps = {
  sentences: Array<SentenceData>,
  parseSentences: Function,
}
type AppState = {
  i: number,
  text: string,
  highlightedSentenceIndex: ?number,
}
export class App extends Component {
  props : AppProps
  state : AppState = {
    i: 0,
    text: lipu_ni,
    highlightedSentenceIndex: null,
  }
  textarea : HTMLInputElement

  handleInputChange = () : void => {
    this.setState({ text: this.textarea.value })
  }

  parse = () : void => {
    // this.setState({ sentences: parseAndAddIndexes(this.state.text) })
    this.props.parseSentences(this.state.text)
  }

  render() {
    const { text } = this.state
    const { sentences } = this.props
    const commonSentenceProps = (i) => ({
      // onMouseEnter: () => this.setState({ highlightedSentenceIndex: i }),
      // onMouseLeave: () => this.setState({ highlightedSentenceIndex: null }),
      highlighted: this.state.highlightedSentenceIndex === i,
    })

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <p>
          <textarea value={text} onChange={this.handleInputChange} ref={(e) => this.textarea = e} />
          <button onClick={this.parse}>hi!</button>
          <br />
        </p>
        <section>
        {intersperse(' ', sentences.map((s, i) => <Sentence tp={s} key={i} index={i} {...commonSentenceProps(i)}/>))}
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ sentences: state.tpSentences })
const mapDispatchToProps = { parseSentences }

export default connect(mapStateToProps, mapDispatchToProps)(App)
