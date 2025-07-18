import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { getUser } from "../hooks/login.actions";

interface ProtectedRouteProps {
	children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
	const user = getUser();

	if (!user) {
		console.warn("ProtectedRoute: No user found, redirecting to /login");
		return <Navigate to="/login" />;
	}

	return <div>{children}</div>;
}

export default ProtectedRoute;
