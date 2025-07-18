import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAccessToken } from "./login.actions";

const baseURL = process.env.REACT_APP_BUJO_BASE_URL?.endsWith("/")
	? process.env.REACT_APP_BUJO_BASE_URL
	: (process.env.REACT_APP_BUJO_BASE_URL || "http://localhost:8000/api/") +
	  "/";

export interface DiaryEntry {
	id: number;
	title: string;
	content: string;
	date_created: string;
	user_id: string;
	date?: string;
}

export interface DiaryEntryCreate {
	title: string;
	content: string;
	date?: string;
}

export interface DiaryEntryUpdate {
	title?: string;
	content?: string;
	date?: string;
}

export function useDiaryApi() {
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

	const fetchEntries = async (): Promise<
		DiaryEntry[] | { results?: DiaryEntry[] }
	> => {
		if (!userId) {
			// User is not logged in, redirect to login and prevent API call
			navigate("/login", { replace: true });
			throw new Error("User not logged in");
		}
		const token = getToken();
		if (!token) throw new Error("No token");

		const user = parseJwt(token);
		if (!user || !user.user_id) throw new Error("Invalid token payload");

		const res = await fetch(`${baseURL}diary/${String(userId)}`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		return res.json();
	};

	const createEntry = async (data: DiaryEntryCreate): Promise<DiaryEntry> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse<DiaryEntry> = await axios.post(
				`${baseURL}diary/`,
				data,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return res.data;
		} catch (err: any) {
			setError(err.message || "Failed to create diary entry");
			setLoading(false);
			throw err;
		}
	};

	const updateEntry = async (
		id: number,
		data: DiaryEntryUpdate
	): Promise<DiaryEntry> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse<DiaryEntry> = await axios.patch(
				`${baseURL}diary/${id}/`,
				data,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return res.data;
		} catch (err: any) {
			setError(err.message || "Failed to update diary entry");
			setLoading(false);
			throw err;
		}
	};

	const deleteEntry = async (id: number): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse = await axios.delete(
				`${baseURL}diary/${id}/`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return true;
		} catch (err: any) {
			setError(err.message || "Failed to delete diary entry");
			setLoading(false);
			throw err;
		}
	};

	return {
		fetchEntries,
		createEntry,
		updateEntry,
		deleteEntry,
		loading,
		error,
	};
}
