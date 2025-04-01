const initialState = {
	user: null,
};

const loginReducer = (state = initialState, action) => {
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
