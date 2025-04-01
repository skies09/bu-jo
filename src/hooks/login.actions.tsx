import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosService from "../helpers/axios";
import axios from "axios";
import { setLogin } from "../store/login/actions";

function useLoginActions() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const baseURL = process.env.REACT_APP_BUJO_BASE_URL;

	return {
		login,
		logout,
		edit,
	};

	// Login the user
	function login(data: any) {
		return axios.post(`${baseURL}api/auth/login/`, data).then((res) => {
			// Registering the account and tokens in the store
			setLoginData(res.data);
			dispatch(setLogin(res.data.user.id));
			navigate("/KennelAccount");
		});
	}

	// Edit the user
	function edit(data: any, userId: string) {
		return axiosService
			.patch(`${baseURL}api/user/${userId}/`, data, {
				headers: {
					"Content-Type": "application/json", // Explicitly set for JSON requests
				},
			})
			.then((res: any) => {
				console.log(res, "RES");
				// Registering the account in the store
				localStorage.setItem(
					"auth",
					JSON.stringify({
						access: getAccessToken(),
						refresh: getRefreshToken(),
						user: res.data,
					})
				);
			});
	}

	// Logout the user
	function logout() {
		return axiosService
			.post(`${baseURL}/auth/logout/`, { refresh: getRefreshToken() })
			.then(() => {
				localStorage.removeItem("auth");
				navigate("/login");
			});
	}
}

// Get the user
function getUser() {
	const storedAuth = localStorage.getItem("auth");
	const auth = storedAuth ? JSON.parse(storedAuth) : null;
	if (auth) {
		return auth.user;
	} else {
		return null;
	}
}

// Get the access token
function getAccessToken() {
	const storedAuth = localStorage.getItem("auth");
	const auth = storedAuth ? JSON.parse(storedAuth) : null;
	return auth.access;
}

// Get the refresh token
function getRefreshToken() {
	const storedAuth = localStorage.getItem("auth");
	const auth = storedAuth ? JSON.parse(storedAuth) : null;
	return auth.refresh;
}

// Set the access, token and user property
function setLoginData(data: any) {
	localStorage.setItem(
		"auth",
		JSON.stringify({
			access: data.access,
			refresh: data.refresh,
			user: data.user,
		})
	);
}

export {
	useLoginActions,
	getUser,
	getAccessToken,
	getRefreshToken,
	setLoginData,
};
