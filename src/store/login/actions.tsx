// KENNEL ACTIONS
export const setLogin = (user: any) => ({
	type: "SET_LOGIN",
	payload: user,
});

export const loginActions = {
	login: async (data: any) => {
		console.log("Logging in", data);
		// Replace with real API call
	},
	register: async (data: any) => {
		console.log("Registering", data);
		// Replace with real API call
	},
	forgotPassword: async (data: any) => {
		console.log("Sending reset link", data);
		// Replace with real API call
	},
};
