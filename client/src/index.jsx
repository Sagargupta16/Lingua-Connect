import { configureStore } from "@reduxjs/toolkit";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import rootReducer from "./store/index";

const root = ReactDOM.createRoot(document.getElementById("root"));
const store = configureStore({
  reducer: rootReducer,
});

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
