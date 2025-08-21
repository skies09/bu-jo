import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAccessToken } from "./login.actions";

const baseURL = process.env.REACT_APP_BUJO_BASE_URL?.endsWith("/")
	? process.env.REACT_APP_BUJO_BASE_URL
	: (process.env.REACT_APP_BUJO_BASE_URL || "http://localhost:8000/api/") +
	  "/";

export interface About {
	id: string;
	nickname?: string;
	location?: string;
	occupation?: string;
	education?: string;
	personality_type?: string;
	zodiac_sign?: string;
	life_goals?: string;
	personal_mission?: string;
	hobbies?: string;
	interests?: string;
	lifestyle_preferences?: string;
	personal_story?: string;
	achievements?: string;
	challenges_overcome?: string;
	core_values?: string;
	beliefs?: string;
	philosophy?: string;
	relationship_status?: string;
	family_info?: string;
	social_preferences?: string;
	career_goals?: string;
	skills?: string;
	work_style?: string;
	health_goals?: string;
	fitness_preferences?: string;
	wellness_practices?: string;
	creative_interests?: string;
	artistic_preferences?: string;
	self_expression?: string;
	bucket_list?: string;
	dreams_aspirations?: string;
	future_plans?: string;
	notes?: string;
	is_public: boolean;
	created: string;
	updated: string;
}

export interface AboutCreate {
	nickname?: string;
	location?: string;
	occupation?: string;
	education?: string;
	personality_type?: string;
	zodiac_sign?: string;
	life_goals?: string;
	personal_mission?: string;
	hobbies?: string;
	interests?: string;
	lifestyle_preferences?: string;
	personal_story?: string;
	achievements?: string;
	challenges_overcome?: string;
	core_values?: string;
	beliefs?: string;
	philosophy?: string;
	relationship_status?: string;
	family_info?: string;
	social_preferences?: string;
	career_goals?: string;
	skills?: string;
	work_style?: string;
	health_goals?: string;
	fitness_preferences?: string;
	wellness_practices?: string;
	creative_interests?: string;
	artistic_preferences?: string;
	self_expression?: string;
	bucket_list?: string;
	dreams_aspirations?: string;
	future_plans?: string;
	notes?: string;
	is_public?: boolean;
}

export interface AboutUpdate {
	nickname?: string;
	location?: string;
	occupation?: string;
	education?: string;
	personality_type?: string;
	zodiac_sign?: string;
	life_goals?: string;
	personal_mission?: string;
	hobbies?: string;
	interests?: string;
	lifestyle_preferences?: string;
	personal_story?: string;
	achievements?: string;
	challenges_overcome?: string;
	core_values?: string;
	beliefs?: string;
	philosophy?: string;
	relationship_status?: string;
	family_info?: string;
	social_preferences?: string;
	career_goals?: string;
	skills?: string;
	work_style?: string;
	health_goals?: string;
	fitness_preferences?: string;
	wellness_practices?: string;
	creative_interests?: string;
	artistic_preferences?: string;
	self_expression?: string;
	bucket_list?: string;
	dreams_aspirations?: string;
	future_plans?: string;
	notes?: string;
	is_public?: boolean;
}

export function useAboutApi() {
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

	const fetchAbout = async (): Promise<About> => {
		if (!userId) {
			navigate("/login", { replace: true });
			throw new Error("User not logged in");
		}
		const token = getToken();
		if (!token) throw new Error("No token");

		const user = parseJwt(token);
		if (!user || !user.user_id) throw new Error("Invalid token payload");

		const res = await fetch(`${baseURL}profile/about/`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		return res.json();
	};

	const createAbout = async (data: AboutCreate): Promise<About> => {
		setLoading(true);
		setError(null);
		try {
			const token = getToken();
			const res: AxiosResponse<About> = await axios.post(
				`${baseURL}profile/about/`,
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
			setError(err.message || "Failed to create about section");
			setLoading(false);
			throw err;
		}
	};

	const updateAbout = async (
		id: string,
		data: AboutUpdate
	): Promise<About> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse<About> = await axios.patch(
				`${baseURL}profile/about/${id}/`,
				data,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return res.data;
		} catch (err: any) {
			setError(err.message || "Failed to update about section");
			setLoading(false);
			throw err;
		}
	};

	const deleteAbout = async (id: string): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse = await axios.delete(
				`${baseURL}profile/about/${id}/`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return true;
		} catch (err: any) {
			setError(err.message || "Failed to delete about section");
			setLoading(false);
			throw err;
		}
	};

	return {
		fetchAbout,
		createAbout,
		updateAbout,
		deleteAbout,
		loading,
		error,
	};
}
