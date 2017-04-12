import { createStore, applyMiddleware, compose } from 'redux'
import reducer from './reducers'
import epic from './epics'
import { createEpicMiddleware } from 'redux-observable';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default function getStore() {
  return (process.env.NODE_ENV === 'production'
    ? Promise.resolve({ data: window.tpLemmas })
    : fetch('/api/tp-lemmas', { headers: {
    Accept: 'application/json',
  } })
  ).then(r => r.json())
  .then((tpLemmas) => window.s = createStore(
    reducer,
    composeEnhancers(
      applyMiddleware(createEpicMiddleware(epic))
    )
  ))
}
