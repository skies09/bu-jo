// src/store/store.js
import { createStore, combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import loginReducer from "./login/reducers";

// Theme reducer
const getInitialTheme = () => {
	try {
		const storedAuth = localStorage.getItem("auth");
		if (storedAuth) {
			const auth = JSON.parse(storedAuth);
			return auth.user?.theme || "auto";
		}
	} catch (e) {
		console.error("Failed to parse theme from localStorage", e);
	}
	return "auto";
};

const themeReducer = (state = getInitialTheme(), action: any) => {
	switch (action.type) {
		case "SET_THEME":
			return action.payload;
		default:
			return state;
	}
};

// Combine reducers to handle multiple slices of state
const rootReducer = combineReducers({
	login: loginReducer,
	theme: themeReducer,
});

// Hydrate state from localStorage
const getPreloadedState = () => {
	try {
		const storedAuth = localStorage.getItem("auth");
		if (storedAuth) {
			const auth = JSON.parse(storedAuth);
			return {
				login: { user: auth.user || null },
				theme: auth.user?.theme || "auto",
			};
		}
	} catch (e) {
		console.error("Failed to parse user from localStorage", e);
	}
	return undefined;
};

// Create the Redux store with the combined reducer and preloaded state
const store = createStore(
	rootReducer,
	getPreloadedState(),
	composeWithDevTools()
);

export default store;
