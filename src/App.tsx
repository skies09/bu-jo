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

function App() {
	return (
		<Router>
			<Layout>
				<Routes>
					<Route path="/" element={<RootRedirect />} />
					<Route path="/home" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/profile" element={<Profile />} />
					<Route
						path="/diary"
						element={
							<ProtectedRoute>
								<Diary />
							</ProtectedRoute>
						}
					/>
					{/* <Route
						path="/account"
						element={
							<ProtectedRoute>
								<Route path="/" element={<Login />} />
							</ProtectedRoute>
						}
					/> */}

					{/* <Route path="/Contact" element={<Contact />} /> */}
				</Routes>
			</Layout>
		</Router>
	);
}

export default App;
