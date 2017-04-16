import channel from './utils/channel'
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import rxjs from 'rxjs' // eslint-disable-line no-unused-vars
import App from './components/App'
import getStore from './redux'

channel.join()
  .receive('ok', (r) => {
    console.log('JOIN WORKEDDED???! :OOO')
  })
  .receive('error', reason => console.log('join failed :(', reason))

getStore().then((store) => {
  ReactDOM.render(
    <Provider store={store}>
    <App />
    </Provider>,
    document.getElementById('root')
  );
})
