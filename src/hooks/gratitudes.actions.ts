import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAccessToken } from "./login.actions";

const baseURL = process.env.REACT_APP_BUJO_BASE_URL?.endsWith("/")
	? process.env.REACT_APP_BUJO_BASE_URL
	: (process.env.REACT_APP_BUJO_BASE_URL || "http://localhost:8000/api/") +
	  "/";

export interface Gratitude {
	id: string;
	text: string;
	category?: string;
	is_active: boolean;
	order: number;
	created: string;
	updated: string;
}

export interface GratitudeCreate {
	text: string;
	category?: string;
	is_active?: boolean;
}

export interface GratitudeUpdate {
	text?: string;
	category?: string;
	is_active?: boolean;
}

export function useGratitudesApi() {
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

	const fetchGratitudes = async (): Promise<
		Gratitude[] | { results?: Gratitude[] }
	> => {
		if (!userId) {
			navigate("/login", { replace: true });
			throw new Error("User not logged in");
		}
		const token = getToken();
		if (!token) throw new Error("No token");

		const user = parseJwt(token);
		if (!user || !user.user_id) throw new Error("Invalid token payload");

		const res = await fetch(`${baseURL}profile/gratitudes/`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		return res.json();
	};

	const getGratitude = async (id: string): Promise<Gratitude> => {
		const token = getToken();
		if (!token) throw new Error("No token");

		const res = await fetch(`${baseURL}profile/gratitudes/${id}/`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		if (!res.ok) {
			throw new Error("Failed to fetch gratitude");
		}

		return res.json();
	};

	const createGratitude = async (data: GratitudeCreate): Promise<Gratitude> => {
		setLoading(true);
		setError(null);
		try {
			const token = getToken();
			const res: AxiosResponse<Gratitude> = await axios.post(
				`${baseURL}profile/gratitudes/`,
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
			setError(err.message || "Failed to create gratitude");
			setLoading(false);
			throw err;
		}
	};

	const updateGratitude = async (
		id: string,
		data: GratitudeUpdate
	): Promise<Gratitude> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse<Gratitude> = await axios.patch(
				`${baseURL}profile/gratitudes/${id}/`,
				data,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return res.data;
		} catch (err: any) {
			setError(err.message || "Failed to update gratitude");
			setLoading(false);
			throw err;
		}
	};

	const deleteGratitude = async (id: string): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse = await axios.delete(
				`${baseURL}profile/gratitudes/${id}/`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return true;
		} catch (err: any) {
			setError(err.message || "Failed to delete gratitude");
			setLoading(false);
			throw err;
		}
	};

	return {
		fetchGratitudes,
		getGratitude,
		createGratitude,
		updateGratitude,
		deleteGratitude,
		loading,
		error,
	};
}
