import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Header from "./components/header";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import Login from "./pages/login";

function Layout({ children }: { children: React.ReactNode }) {
	const location = useLocation();

	return (
		<>
			{location.pathname === "/home" && (
				<>
					<Navbar />
					<Header />
				</>
			)}
			{children}
		</>
	);
}

function App() {
	return (
		<Router>
			<Layout>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/home" element={<Home />} />
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
