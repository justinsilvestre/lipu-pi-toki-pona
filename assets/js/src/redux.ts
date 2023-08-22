import { createStore, applyMiddleware, compose } from "redux";
import reducer from "./reducers";
import epic from "./epics";
import { createEpicMiddleware } from "redux-observable";
import { normalize, schema } from "normalizr";

const tpLemmaSchema = new schema.Entity("tpLemmas");

const composeEnhancers =
  process.env.NODE_ENV === "development"
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

export default function getStore() {
  return fetch("/api/tp-lemmas", {
    headers: {
      Accept: "application/json",
    },
  })
    .then((r) => r.json())
    .then((tpLemmas) => {
      const middlewares: any[] = [];
      const epicMiddleware = createEpicMiddleware({
        dependencies: {
          get dispatch() {
            return store.dispatch;
          },
        },
      });
      middlewares.push(applyMiddleware(epicMiddleware));
      const store = createStore(
        reducer,
        { tpLemmas: normalize(tpLemmas, [tpLemmaSchema]).entities.tpLemmas },
        composeEnhancers(...middlewares)
      );

      epicMiddleware.run(epic);
      return store;
    });
}
