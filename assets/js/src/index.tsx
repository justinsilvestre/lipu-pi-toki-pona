import channel from "./utils/channel";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./components/App";
import getStore from "./redux";

channel
  .join()
  .receive("ok", (r) => {
    console.log("join OK");
  })
  .receive("error", (reason) => console.log("join failed :(", reason));

getStore().then((store) => {
  const container = document.getElementById("root");
  const root = createRoot(container);
  root.render(
    <Provider store={store}>
      <App />
    </Provider>
  );
});
