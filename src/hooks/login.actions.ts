import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import axiosService from "../helpers/axios";

// Interfaces for user and login data
export interface User {
	id: number;
	username: string;
	email: string;
	name?: string;
	bio?: string;
	avatar?: string;
	date_of_birth?: string;
	theme?: string;
	is_active?: boolean;
	created?: string;
	updated?: string;
	// Add more fields as needed
}

export interface LoginResponse {
	access: string;
	refresh: string;
	user: User;
}

export interface LoginData {
	email: string;
	password: string;
}

export interface EditUserData {
	[key: string]: any;
}

function useLoginActions() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const baseURL = process.env.REACT_APP_BUJO_BASE_URL;

	// Define setLogin locally to avoid circular imports
	const setLogin = (user: any) => ({
		type: "SET_LOGIN",
		payload: user,
	});

	// Helper to set auth header on both axios instances
	function setAuthHeader(token: string | null): void {
		if (token) {
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
			axiosService.defaults.headers.common[
				"Authorization"
			] = `Bearer ${token}`;
		} else {
			delete axios.defaults.headers.common["Authorization"];
			delete axiosService.defaults.headers.common["Authorization"];
		}
	}

	// Login the user
	async function login(data: LoginData): Promise<void> {
		try {
			const res: AxiosResponse<LoginResponse> = await axios.post(
				`${baseURL}auth/login/`,
				data
			);
			setLoginData(res.data);
			dispatch(setLogin(res.data.user));
			navigate("/home");
		} catch (err: any) {
			console.error("Login failed:", err.response || err.message);
			throw err;
		}
	}

	// Edit the user
	async function edit(data: EditUserData, userId: number): Promise<void> {
		const res: AxiosResponse<User> = await axiosService.patch(
			`${baseURL}user/${userId}/`,
			data,
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
		// Update auth in localStorage with current tokens + new user info
		localStorage.setItem(
			"auth",
			JSON.stringify({
				access: getAccessToken(),
				refresh: getRefreshToken(),
				user: res.data,
			})
		);
	}

	// Logout the user
	async function logout(): Promise<void> {
		await axiosService.post(`${baseURL}auth/logout/`, {
			refresh: getRefreshToken(),
		});
		localStorage.removeItem("auth");
		setAuthHeader(null);
		navigate("/login");
	}

	// Register the user
	async function register(data: any): Promise<any> {
		try {
			const res = await axios.post(`${baseURL}auth/register/`, data);
			// Optionally auto-login after registration:
			// setLoginData(res.data);
			// dispatch(setLogin(res.data.user));
			// navigate("/home");
			return res;
		} catch (error) {
			console.error("Registration error:", error);
			throw error;
		}
	}

	// Forgot password
	async function forgotPassword(data: any): Promise<void> {
		console.log("Sending reset link", data);
		// Implement forgot password logic here
	}

	return {
		login,
		logout,
		edit,
		setAuthHeader,
		register,
		forgotPassword,
	};
}

// Get the user from localStorage auth object
function getUser(): User | null {
	try {
		const storedAuth = localStorage.getItem("auth");
		if (!storedAuth) return null;
		const auth = JSON.parse(storedAuth);
		return auth && auth.user ? auth.user : null;
	} catch (e) {
		console.error("Failed to parse user from localStorage", e);
		return null;
	}
}

// Get the access token from localStorage auth object
function getAccessToken(): string | null {
	const storedAuth = localStorage.getItem("auth");
	const auth = storedAuth ? JSON.parse(storedAuth) : null;
	return auth ? auth.access : null;
}

// Get the refresh token from localStorage auth object
function getRefreshToken(): string | null {
	const storedAuth = localStorage.getItem("auth");
	const auth = storedAuth ? JSON.parse(storedAuth) : null;
	return auth ? auth.refresh : null;
}

// Store login data in localStorage
function setLoginData(data: LoginResponse): void {
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
