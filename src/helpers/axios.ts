import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import {
	getAccessToken,
	getRefreshToken,
	getUser,
} from "../hooks/login.actions";

const axiosService = axios.create({
	baseURL: process.env.REACT_APP_BUJO_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

axiosService.interceptors.request.use(async (config: AxiosRequestConfig) => {
	config.headers = config.headers || {};
	(config.headers as any).Authorization = `Bearer ${getAccessToken()}`;
	return config;
});

axiosService.interceptors.response.use(
	(res: AxiosResponse) => Promise.resolve(res),
	(err) => Promise.reject(err)
);

const refreshAuthLogic = async (failedRequest: any): Promise<void> => {
	return axios
		.post(
			"/auth/refresh/",
			{
				refresh: getRefreshToken(),
			},
			{
				baseURL: process.env.REACT_APP_BUJO_BASE_URL,
			}
		)
		.then((resp: AxiosResponse) => {
			const { access } = resp.data;
			failedRequest.response.config.headers["Authorization"] =
				"Bearer " + access;
			localStorage.setItem(
				"auth",
				JSON.stringify({
					access,
					refresh: getRefreshToken(),
					user: getUser(),
				})
			);
		})
		.catch(() => {
			localStorage.removeItem("auth");
		});
};

createAuthRefreshInterceptor(axiosService, refreshAuthLogic);

export function fetcher<T = any>(url: string): Promise<T> {
	return axiosService.get<T>(url).then((res) => res.data);
}

export default axiosService;
