import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
	Navigate,
} from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/home";
import Login from "./pages/login";
import Diary from "./pages/diary";
import Navbar from "./components/navbar";
import TopNav from "./components/topNav";
import Profile from "./pages/profile";
import Bullet from "./pages/bullet";
import React from "react";
import { useSelector } from "react-redux";

export const routeConfig = [
	{ path: "/", element: <RootRedirect />, protected: false },
	{ path: "/login", element: <Login />, protected: false },
	{ path: "/home", element: <Home />, protected: true },
	{ path: "/profile", element: <Profile />, protected: true },
	{ path: "/diary", element: <Diary />, protected: true },
	{ path: "/bullet", element: <Bullet />, protected: true },
];

function Layout({ children }: { children: React.ReactNode }) {
	const location = useLocation();

	const removeNavAndHeader = ["/", "/login"].includes(location.pathname);

	return (
		<>
			{!removeNavAndHeader && (
				<>
					<Navbar />
					<TopNav />
				</>
			)}
			{children}
		</>
	);
}

function isTokenValid(token: string | null): boolean {
	if (!token) return false;

	try {
		// JWT format: header.payload.signature
		const payloadBase64 = token.split(".")[1];
		if (!payloadBase64) return false;

		// Decode base64 payload
		const decoded = JSON.parse(atob(payloadBase64));
		const exp = decoded.exp; // expiry in seconds since epoch

		if (!exp) return false;

		// Check if current time (in seconds) is before expiry
		return Date.now() / 1000 < exp;
	} catch {
		return false;
	}
}

function isAuthenticated() {
	try {
		const storedAuth = localStorage.getItem("auth");
		if (!storedAuth) return false;
		const auth = JSON.parse(storedAuth);
		if (!auth || !auth.access || !auth.user) return false;
		return isTokenValid(auth.access);
	} catch {
		return false;
	}
}

// Component for /
function RootRedirect() {
	return isAuthenticated() ? (
		<Navigate to="/home" replace />
	) : (
		<Navigate to="/login" replace />
	);
}

const App = () => {
	const theme = useSelector((state: any) => state.theme);
	React.useEffect(() => {
		// Set a data-theme attribute on the body for theme switching
		document.body.setAttribute("data-theme", theme);
	}, [theme]);

	return (
		<Router>
			<Layout>
				<div className={`min-h-screen`}>
					<Routes>
						{routeConfig.map(
							({ path, element, protected: isProtected }) => (
								<Route
									key={path}
									path={path}
									element={
										isProtected ? (
											<ProtectedRoute>
												{element}
											</ProtectedRoute>
										) : (
											element
										)
									}
								/>
							)
						)}
					</Routes>
				</div>
			</Layout>
		</Router>
	);
};

export default App;
