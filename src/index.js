import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import rxjs from 'rxjs' // eslint-disable-line no-unused-vars
import App from './components/App'
import store from './redux'
import socket from './utils/socket'

socket.connect()
const channel = socket.channel('translate:' + 42)
channel.on('ping', (o) => console.log("PING!", o.count, o))
channel.join()
  .receive('ok', (r) => {
    console.log('JOIN WORKEDDED???! :OOO')
  })
  .receive('error', reason => console.log('join failed :(', reason))

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
