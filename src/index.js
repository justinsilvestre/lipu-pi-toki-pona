import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import rxjs from 'rxjs'
import App from './components/App'
import store from './redux'

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
