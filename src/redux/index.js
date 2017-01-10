import { createStore, applyMiddleware, compose } from 'redux'
import reducer from './reducer'
import epic from './epics'
import { createEpicMiddleware } from 'redux-observable';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
  reducer,
  composeEnhancers(
    applyMiddleware(createEpicMiddleware(epic))
  )
)

export default store

window.s = store
