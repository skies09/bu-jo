import React from "react";
import { Navigate } from "react-router-dom";

import { getUser } from "../hooks/login.actions";

function ProtectedRoute({ children }) {
	const user = getUser();

	return user ? <div>{children}</div> : <Navigate to="/account/" />;
}

export default ProtectedRoute;
