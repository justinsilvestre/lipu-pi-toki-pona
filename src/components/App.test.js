import React from 'react';
import ReactDOM from 'react-dom';
import rita from 'rita'
window.RiTa = rita
import { App } from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App sentences={[]} />, div);
})
