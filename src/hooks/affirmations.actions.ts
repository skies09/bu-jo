import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAccessToken } from "./login.actions";

const baseURL = process.env.REACT_APP_BUJO_BASE_URL?.endsWith("/")
	? process.env.REACT_APP_BUJO_BASE_URL
	: (process.env.REACT_APP_BUJO_BASE_URL || "http://localhost:8000/api/") +
	  "/";

export interface Affirmation {
	id: string;
	text: string;
	category?: string;
	is_active: boolean;
	order: number;
	created: string;
	updated: string;
}

export interface AffirmationCreate {
	text: string;
	category?: string;
	is_active?: boolean;
}

export interface AffirmationUpdate {
	text?: string;
	category?: string;
	is_active?: boolean;
}

export function useAffirmationsApi() {
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

	const fetchAffirmations = async (): Promise<
		Affirmation[] | { results?: Affirmation[] }
	> => {
		if (!userId) {
			navigate("/login", { replace: true });
			throw new Error("User not logged in");
		}
		const token = getToken();
		if (!token) throw new Error("No token");

		const user = parseJwt(token);
		if (!user || !user.user_id) throw new Error("Invalid token payload");

		const res = await fetch(`${baseURL}profile/affirmations/`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		return res.json();
	};

	const getAffirmation = async (id: string): Promise<Affirmation> => {
		const token = getToken();
		if (!token) throw new Error("No token");

		const res = await fetch(`${baseURL}profile/affirmations/${id}/`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		if (!res.ok) {
			throw new Error("Failed to fetch affirmation");
		}

		return res.json();
	};

	const createAffirmation = async (data: AffirmationCreate): Promise<Affirmation> => {
		setLoading(true);
		setError(null);
		try {
			const token = getToken();
			const res: AxiosResponse<Affirmation> = await axios.post(
				`${baseURL}profile/affirmations/`,
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
			setError(err.message || "Failed to create affirmation");
			setLoading(false);
			throw err;
		}
	};

	const updateAffirmation = async (
		id: string,
		data: AffirmationUpdate
	): Promise<Affirmation> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse<Affirmation> = await axios.patch(
				`${baseURL}profile/affirmations/${id}/`,
				data,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return res.data;
		} catch (err: any) {
			setError(err.message || "Failed to update affirmation");
			setLoading(false);
			throw err;
		}
	};

	const deleteAffirmation = async (id: string): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse = await axios.delete(
				`${baseURL}profile/affirmations/${id}/`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return true;
		} catch (err: any) {
			setError(err.message || "Failed to delete affirmation");
			setLoading(false);
			throw err;
		}
	};

	return {
		fetchAffirmations,
		getAffirmation,
		createAffirmation,
		updateAffirmation,
		deleteAffirmation,
		loading,
		error,
	};
}
