// src/store/store.js
import { createStore, combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import loginReducer from "./login/reducers";

// Combine reducers to handle multiple slices of state
const rootReducer = combineReducers({
	login: loginReducer,
});

// Hydrate state from localStorage
const getPreloadedState = () => {
	try {
		const storedAuth = localStorage.getItem("auth");
		if (storedAuth) {
			const auth = JSON.parse(storedAuth);
			return { login: { user: auth.user || null } };
		}
	} catch (e) {
		console.error("Failed to parse user from localStorage", e);
	}
	return undefined;
};

// Create the Redux store with the combined reducer and preloaded state
const store = createStore(rootReducer, getPreloadedState(), composeWithDevTools());

export default store;
