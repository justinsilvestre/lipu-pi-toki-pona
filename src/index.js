import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import rxjs from 'rxjs' // eslint-disable-line no-unused-vars
import App from './components/App'
import store from './redux'

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
