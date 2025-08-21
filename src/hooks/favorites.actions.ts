import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAccessToken } from "./login.actions";

const baseURL = process.env.REACT_APP_BUJO_BASE_URL?.endsWith("/")
	? process.env.REACT_APP_BUJO_BASE_URL
	: (process.env.REACT_APP_BUJO_BASE_URL || "http://localhost:8000/api/") +
	  "/";

export interface Favorite {
	id: string;
	title: string;
	description?: string;
	category: string;
	is_active: boolean;
	order: number;
	created: string;
	updated: string;
}

export interface FavoriteCreate {
	title: string;
	description?: string;
	category: string;
	is_active?: boolean;
}

export interface FavoriteUpdate {
	title?: string;
	description?: string;
	category?: string;
	is_active?: boolean;
}

// Category choices matching the backend model
export const CATEGORY_CHOICES = [
	{ value: 'song', label: 'Song' },
	{ value: 'movie', label: 'Movie' },
	{ value: 'book', label: 'Book' },
	{ value: 'color', label: 'Color' },
	{ value: 'season', label: 'Season' },
	{ value: 'food', label: 'Food' },
	{ value: 'place', label: 'Place' },
	{ value: 'hobby', label: 'Hobby' },
	{ value: 'other', label: 'Other' },
];

export function useFavoritesApi() {
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

	const fetchFavorites = async (): Promise<
		Favorite[] | { results?: Favorite[] }
	> => {
		if (!userId) {
			navigate("/login", { replace: true });
			throw new Error("User not logged in");
		}
		const token = getToken();
		if (!token) throw new Error("No token");

		const user = parseJwt(token);
		if (!user || !user.user_id) throw new Error("Invalid token payload");

		const res = await fetch(`${baseURL}profile/favorites/`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		return res.json();
	};

	const getFavorite = async (id: string): Promise<Favorite> => {
		const token = getToken();
		if (!token) throw new Error("No token");

		const res = await fetch(`${baseURL}profile/favorites/${id}/`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		if (!res.ok) {
			throw new Error("Failed to fetch favorite");
		}

		return res.json();
	};

	const createFavorite = async (data: FavoriteCreate): Promise<Favorite> => {
		setLoading(true);
		setError(null);
		try {
			const token = getToken();
			const res: AxiosResponse<Favorite> = await axios.post(
				`${baseURL}profile/favorites/`,
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
			setError(err.message || "Failed to create favorite");
			setLoading(false);
			throw err;
		}
	};

	const updateFavorite = async (
		id: string,
		data: FavoriteUpdate
	): Promise<Favorite> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse<Favorite> = await axios.patch(
				`${baseURL}profile/favorites/${id}/`,
				data,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return res.data;
		} catch (err: any) {
			setError(err.message || "Failed to update favorite");
			setLoading(false);
			throw err;
		}
	};

	const deleteFavorite = async (id: string): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse = await axios.delete(
				`${baseURL}profile/favorites/${id}/`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return true;
		} catch (err: any) {
			setError(err.message || "Failed to delete favorite");
			setLoading(false);
			throw err;
		}
	};

	return {
		fetchFavorites,
		getFavorite,
		createFavorite,
		updateFavorite,
		deleteFavorite,
		loading,
		error,
	};
}
