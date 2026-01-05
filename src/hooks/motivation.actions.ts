import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAccessToken } from "./login.actions";

const baseURL = process.env.REACT_APP_BUJO_BASE_URL?.endsWith("/")
	? process.env.REACT_APP_BUJO_BASE_URL
	: (process.env.REACT_APP_BUJO_BASE_URL || "http://localhost:8000/api/") +
	  "/";

export interface ImageBoard {
	id: string;
	title: string;
	description?: string;
	is_active: boolean;
	order: number;
	public_id: string;
	image_count: number;
	can_add_image: boolean;
	images: ImageBoardItem[];
	created: string;
	updated: string;
}

export interface ImageBoardItem {
	id: string;
	image: string;
	image_url: string;
	caption?: string;
	order: number;
	is_active: boolean;
	public_id: string;
	created: string;
	updated: string;
}

export interface ImageBoardCreate {
	title: string;
	description?: string;
	order?: number;
}

export interface ImageBoardUpdate {
	title?: string;
	description?: string;
	order?: number;
	is_active?: boolean;
}

export interface ImageBoardItemCreate {
	image: File;
	caption?: string;
	order?: number;
}

export interface ImageBoardItemUpdate {
	caption?: string;
	order?: number;
	is_active?: boolean;
}

export interface ReorderRequest {
	items: { id: string; order: number }[];
}

export interface BulkToggleRequest {
	public_ids: string[];
	is_active: boolean;
}

export function useMotivationApi() {
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

	// Image Board API calls
	const fetchImageBoards = async (): Promise<ImageBoard[]> => {
		if (!userId) {
			navigate("/login", { replace: true });
			throw new Error("User not logged in");
		}
		const token = getToken();
		if (!token) throw new Error("No token");

		const res = await fetch(`${baseURL}motivation/boards/`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		const data = await res.json();
		return data.results || data;
	};

	const createImageBoard = async (data: ImageBoardCreate): Promise<ImageBoard> => {
		setLoading(true);
		setError(null);
		try {
			const token = getToken();
			const res: AxiosResponse<ImageBoard> = await axios.post(
				`${baseURL}motivation/boards/`,
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
			setError(err.message || "Failed to create image board");
			setLoading(false);
			throw err;
		}
	};

	const getImageBoard = async (publicId: string): Promise<ImageBoard> => {
		const token = getToken();
		if (!token) throw new Error("No token");

		const res = await fetch(`${baseURL}motivation/boards/${publicId}/`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/login";
			throw new Error("Unauthorized");
		}

		if (!res.ok) {
			throw new Error("Failed to fetch image board");
		}

		return res.json();
	};

	const updateImageBoard = async (
		publicId: string,
		data: ImageBoardUpdate
	): Promise<ImageBoard> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse<ImageBoard> = await axios.patch(
				`${baseURL}motivation/boards/${publicId}/`,
				data,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return res.data;
		} catch (err: any) {
			setError(err.message || "Failed to update image board");
			setLoading(false);
			throw err;
		}
	};

	const deleteImageBoard = async (publicId: string): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse = await axios.delete(
				`${baseURL}motivation/boards/${publicId}/`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return true;
		} catch (err: any) {
			setError(err.message || "Failed to delete image board");
			setLoading(false);
			throw err;
		}
	};

	// Image Board Item API calls
	const addImageToBoard = async (
		boardPublicId: string,
		data: ImageBoardItemCreate
	): Promise<ImageBoardItem> => {
		setLoading(true);
		setError(null);
		try {
			const token = getToken();
			const formData = new FormData();
			formData.append("image", data.image);
			if (data.caption) formData.append("caption", data.caption);
			if (data.order) formData.append("order", data.order.toString());

			const res: AxiosResponse<ImageBoardItem> = await axios.post(
				`${baseURL}motivation/boards/${boardPublicId}/add_image/`,
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return res.data;
		} catch (err: any) {
			setError(err.message || "Failed to add image to board");
			setLoading(false);
			throw err;
		}
	};

	const updateImage = async (
		publicId: string,
		data: ImageBoardItemUpdate
	): Promise<ImageBoardItem> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse<ImageBoardItem> = await axios.patch(
				`${baseURL}motivation/images/${publicId}/`,
				data,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return res.data;
		} catch (err: any) {
			setError(err.message || "Failed to update image");
			setLoading(false);
			throw err;
		}
	};

	const deleteImage = async (publicId: string): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse = await axios.delete(
				`${baseURL}motivation/images/${publicId}/`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return true;
		} catch (err: any) {
			setError(err.message || "Failed to delete image");
			setLoading(false);
			throw err;
		}
	};

	const reorderImages = async (
		boardPublicId: string,
		data: ReorderRequest
	): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse = await axios.post(
				`${baseURL}motivation/boards/${boardPublicId}/reorder_images/`,
				data,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return true;
		} catch (err: any) {
			setError(err.message || "Failed to reorder images");
			setLoading(false);
			throw err;
		}
	};

	const bulkToggleImages = async (data: BulkToggleRequest): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const token = getToken();
			const res: AxiosResponse = await axios.post(
				`${baseURL}motivation/images/bulk_toggle_active/`,
				data,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			checkLoggedIn(res.status);
			setLoading(false);
			return true;
		} catch (err: any) {
			setError(err.message || "Failed to bulk toggle images");
			setLoading(false);
			throw err;
		}
	};

	return {
		fetchImageBoards,
		createImageBoard,
		getImageBoard,
		updateImageBoard,
		deleteImageBoard,
		addImageToBoard,
		updateImage,
		deleteImage,
		reorderImages,
		bulkToggleImages,
		loading,
		error,
	};
}
