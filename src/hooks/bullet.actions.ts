import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAccessToken } from "./login.actions";

const baseURL = process.env.REACT_APP_BUJO_BASE_URL?.endsWith("/")
	? process.env.REACT_APP_BUJO_BASE_URL
	: (process.env.REACT_APP_BUJO_BASE_URL || "http://localhost:8000/api/") +
	  "/";

export interface Bullet {
	id: string;
	date: string;
	day_rating: number;
	mood: number;
	anxiety: number;
	eating_habits: number;
	created: string;
	updated: string;
}

export interface BulletCreate {
	date?: string;
	day_rating: number;
	mood: number;
	anxiety: number;
	eating_habits: number;
}

export interface BulletUpdate {
	date?: string;
	day_rating?: number;
	mood?: number;
	anxiety?: number;
	eating_habits?: number;
}

export interface FieldHistoryData {
	date: string;
	rating: number;
}

export interface FieldHistory {
	field: string;
	period_days: number;
	start_date: string;
	end_date: string;
	total_entries: number;
	data: FieldHistoryData[];
}

export interface BulletAverages {
	day_rating: number;
	mood: number;
	anxiety: number;
	eating_habits: number;
}

export const RATING_FIELDS = [
	{ key: "day_rating", label: "Day Rating", description: "Overall day rating" },
	{ key: "mood", label: "Mood", description: "How you felt today" },
	{ key: "anxiety", label: "Anxiety", description: "Anxiety level (lower is better)" },
	{ key: "eating_habits", label: "Eating Habits", description: "How well you ate today" },
];

export const RATING_SCALE = [
	{ value: 1, label: "Very Poor/Low", color: "#ef4444" }, // red-500
	{ value: 2, label: "Poor/Low", color: "#f97316" }, // orange-500
	{ value: 3, label: "Average/Neutral", color: "#eab308" }, // yellow-500
	{ value: 4, label: "Good/High", color: "#22c55e" }, // green-500
	{ value: 5, label: "Excellent/Very High", color: "#3b82f6" }, // blue-500
];

export function useBulletApi() {
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

	const fetchBullets = async (): Promise<
		Bullet[] | { results?: Bullet[] }
	> => {
		if (!userId) {
			navigate("/login", { replace: true });
			throw new Error("User not logged in");
		}
		const token = getToken();
		if (!token) throw new Error("No token");

		const user = parseJwt(token);
		if (!user || !user.user_id) throw new Error("Invalid token payload");

		const res = await fetch(`${baseURL}bullet/`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		return res.json();
	};

	const getBullet = async (id: string): Promise<Bullet> => {
		const token = getToken();
		if (!token) throw new Error("No token");

		const res = await fetch(`${baseURL}bullet/${id}/`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		if (!res.ok) {
			throw new Error("Failed to fetch bullet entry");
		}

		return res.json();
	};

	const createBullet = async (data: BulletCreate): Promise<Bullet> => {
		setLoading(true);
		setError(null);
		try {
			const token = getToken();
			const res: AxiosResponse<Bullet> = await axios.post(
				`${baseURL}bullet/`,
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
			setError(err.message || "Failed to create bullet entry");
			setLoading(false);
			throw err;
		}
	};

	const updateBullet = async (
		id: string,
		data: BulletUpdate
	): Promise<Bullet> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse<Bullet> = await axios.patch(
				`${baseURL}bullet/${id}/`,
				data,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return res.data;
		} catch (err: any) {
			setError(err.message || "Failed to update bullet entry");
			setLoading(false);
			throw err;
		}
	};

	const deleteBullet = async (id: string): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse = await axios.delete(
				`${baseURL}bullet/${id}/`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return true;
		} catch (err: any) {
			setError(err.message || "Failed to delete bullet entry");
			setLoading(false);
			throw err;
		}
	};

	const getFieldHistory = async (
		field: string,
		days: number = 365
	): Promise<FieldHistory> => {
		if (!userId) {
			navigate("/login", { replace: true });
			throw new Error("User not logged in");
		}
		const token = getToken();
		if (!token) throw new Error("No token");

		const user = parseJwt(token);
		if (!user || !user.user_id) throw new Error("Invalid token payload");

		const res = await fetch(
			`${baseURL}bullet/field_history/?field=${field}&days=${days}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		if (!res.ok) {
			throw new Error("Failed to fetch field history");
		}

		return res.json();
	};

	const getAverages = async (): Promise<BulletAverages> => {
		if (!userId) {
			navigate("/login", { replace: true });
			throw new Error("User not logged in");
		}
		const token = getToken();
		if (!token) throw new Error("No token");

		const user = parseJwt(token);
		if (!user || !user.user_id) throw new Error("Invalid token payload");

		const res = await fetch(`${baseURL}bullet/averages/`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		if (!res.ok) {
			throw new Error("Failed to fetch averages");
		}

		return res.json();
	};

	return {
		fetchBullets,
		getBullet,
		createBullet,
		updateBullet,
		deleteBullet,
		getFieldHistory,
		getAverages,
		loading,
		error,
	};
}
