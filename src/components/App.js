// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux'
import './App.css';
import Sentence from './Sentence'
import type { Sentence as SentenceData } from '../utils/grammar'
import { parseSentences } from '../redux/actions'

// sina kepeken toki pona la jan li pilin pona.
const lipu_ni = `jan mute o, toki pona li toki lili.
jan Sonja li mama pi toki ni.
jan Jatin li pali e lipu ni.
sina toki pona la jan li pilin pona.
o lukin e lipu ni o kama sona e toki pona!
jan ale li ken lukin e lipu mute li ken pali e lipu sin a!
jan Mawijo li jo e meli olin. nimi ona li Sili. jan Sili li lape lili lon supa. tenpo suno pini la jan Sili li pona e tomo li telo e len. jan Mawijo li kama lon tenpo seme?`
window.lipu_ni = lipu_ni

type AppProps = {
  sentences: Array<SentenceData>,
  parseSentences: Function,
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
    this.props.parseSentences(this.state.text)
  }

  render() {
    const { text } = this.state
    const { sentences } = this.props

    return (
      <div>
        <textarea value={text} onChange={this.handleInputChange} ref={(e) => this.textarea = e} />
        <button onClick={this.parse}>hi!</button>
        <br />

        <section>
        {sentences.map((s, i) => <Sentence tp={s} key={i} index={i}/>)}
        </section>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ sentences: state.tpSentences })
const mapDispatchToProps = { parseSentences }

export default connect(mapStateToProps, mapDispatchToProps)(App)
