import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAccessToken } from "./login.actions";

const baseURL = process.env.REACT_APP_BUJO_BASE_URL?.endsWith("/")
	? process.env.REACT_APP_BUJO_BASE_URL
	: (process.env.REACT_APP_BUJO_BASE_URL || "http://localhost:8000/api/") +
	  "/";

export interface Passion {
	id: string;
	text: string;
	category?: string;
	is_active: boolean;
	order: number;
	created: string;
	updated: string;
}

export interface PassionCreate {
	text: string;
	category?: string;
	is_active?: boolean;
}

export interface PassionUpdate {
	text?: string;
	category?: string;
	is_active?: boolean;
}

export function usePassionsApi() {
	const reduxUser = useSelector(
		(state: { login: { user?: any } }) => state.login.user
	);
	let userId = reduxUser?.id;
	if (!userId) {
		// fallback to user_id from JWT
		const token = getAccessToken();
		if (token) {
			const jwt = parseJwt(token);
			userId = jwt?.user_id;
		}
	}
	const navigate = useNavigate();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const checkLoggedIn = (status: number): void => {
		if (status === 401) {
			localStorage.removeItem("token");
			navigate("/login", { replace: true });
			throw new Error("Unauthorized");
		}
	};

	function parseJwt(token: string): any {
		try {
			const payload = token.split(".")[1];
			return JSON.parse(atob(payload));
		} catch {
			return null;
		}
	}

	const getToken = (): string => {
		try {
			const storedAuth = localStorage.getItem("auth");
			if (!storedAuth) return "";
			const auth = JSON.parse(storedAuth);
			return auth && auth.access ? auth.access : "";
		} catch {
			return "";
		}
	};

	const fetchPassions = async (): Promise<
		Passion[] | { results?: Passion[] }
	> => {
		if (!userId) {
			navigate("/login", { replace: true });
			throw new Error("User not logged in");
		}
		const token = getToken();
		if (!token) throw new Error("No token");

		const user = parseJwt(token);
		if (!user || !user.user_id) throw new Error("Invalid token payload");

		const res = await fetch(`${baseURL}profile/passions/`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		return res.json();
	};

	const getPassion = async (id: string): Promise<Passion> => {
		const token = getToken();
		if (!token) throw new Error("No token");

		const res = await fetch(`${baseURL}profile/passions/${id}/`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		if (!res.ok) {
			throw new Error("Failed to fetch passion");
		}

		return res.json();
	};

	const createPassion = async (data: PassionCreate): Promise<Passion> => {
		setLoading(true);
		setError(null);
		try {
			const token = getToken();
			const res: AxiosResponse<Passion> = await axios.post(
				`${baseURL}profile/passions/`,
				data,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return res.data;
		} catch (err: any) {
			setError(err.message || "Failed to create passion");
			setLoading(false);
			throw err;
		}
	};

	const updatePassion = async (
		id: string,
		data: PassionUpdate
	): Promise<Passion> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse<Passion> = await axios.patch(
				`${baseURL}profile/passions/${id}/`,
				data,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return res.data;
		} catch (err: any) {
			setError(err.message || "Failed to update passion");
			setLoading(false);
			throw err;
		}
	};

	const deletePassion = async (id: string): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse = await axios.delete(
				`${baseURL}profile/passions/${id}/`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return true;
		} catch (err: any) {
			setError(err.message || "Failed to delete passion");
			setLoading(false);
			throw err;
		}
	};

	return {
		fetchPassions,
		getPassion,
		createPassion,
		updatePassion,
		deletePassion,
		loading,
		error,
	};
}
