import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
	Navigate,
} from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Header from "./components/header";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Login from "./pages/login";

function Layout({ children }: { children: React.ReactNode }) {
	const location = useLocation();

	const showNavAndHeader = ["/", "/home"].includes(location.pathname);

	return (
		<>
			{showNavAndHeader && (
				<>
					<Navbar />
					<Header />
				</>
			)}
			{children}
		</>
	);
}

// Simulated auth check (can be replaced with context, etc.)
function isAuthenticated() {
	return localStorage.getItem("token") !== null;
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
