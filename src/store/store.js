// src/store/store.js
import { createStore, combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import loginReducer from "./login/reducers";

// Combine reducers to handle multiple slices of state
const rootReducer = combineReducers({
	login: loginReducer,
});

// Create the Redux store with the combined reducer
const store = createStore(rootReducer, composeWithDevTools());

export default store;
