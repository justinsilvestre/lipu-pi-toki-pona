import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { parse } from 'parse-toki-pona'
import Sentence from './components/Sentence'
import { intersperse } from 'ramda'

const lipu_ni = `toki pona li toki lili.
jan Sonja li mama pi toki ni.
kepeken toki pona la jan li pilin pona.
jan Jatin li pali e lipu ni.
o lukin e lipu ni o kama sona e toki pona!
jan ale li ken lukin e lipu mute li ken pali e lipu sin a!`
window.lipu_ni = lipu_ni

class App extends Component {
  state = {
    i: 0,
    text: lipu_ni,
    sentences: parse(lipu_ni),
    highlightedSentenceIndex: null,
  }

  handleInputChange = (e) => {
    this.setState({ text: e.target.value })
  }

  parse = () => {
    this.setState({ sentences: parse(this.state.text) })
    window.p = parse(this.state.text)
  }

  render() {
    const { text, sentences } = this.state
    const { highlightedWordPair } = this.props
    const commonSentenceProps = (i) => ({
      onMouseEnter: () => this.setState({ highlightedSentenceIndex: i }),
      onMouseLeave: () => this.setState({ highlightedSentenceIndex: null }),
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
          <textarea value={text} onChange={this.handleInputChange}/>
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

export default App
