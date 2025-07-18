import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setLoginData } from "../../hooks/login.actions";

// Login actions
export const setLogin = (user: any) => ({
	type: "SET_LOGIN",
	payload: user,
});

// Custom hook that returns login actions
export const useLoginActions = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const baseURL = process.env.REACT_APP_BUJO_BASE_URL;

	const login = async (data: any) => {
		try {
			const res = await axios.post(`${baseURL}auth/login/`, data);
			setLoginData(res.data); // Store full auth object
			dispatch(setLogin(res.data.user));
			navigate("/home");
			return res;
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	};

	const register = async (data: any) => {
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
	};

	const forgotPassword = async (data: any) => {
		console.log("Sending reset link", data);
		// Implement forgot password logic here
	};

	return { login, register, forgotPassword };
};
