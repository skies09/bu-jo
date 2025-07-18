const getInitialUser = () => {
	try {
		const storedAuth = localStorage.getItem("auth");
		if (storedAuth) {
			const auth = JSON.parse(storedAuth);
			return auth.user || null;
		}
	} catch (e) {
		console.error("Failed to parse user from localStorage", e);
	}
	return null;
};

const initialState = {
	user: getInitialUser(),
};

interface LoginAction {
	type: string;
	payload?: any;
}

const loginReducer = (state = initialState, action: LoginAction) => {
	switch (action.type) {
		case "SET_LOGIN":
			return {
				...state,
				user: action.payload,
			};

		default:
			return state;
	}
};

export default loginReducer;
