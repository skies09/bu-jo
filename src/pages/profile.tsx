import React from "react";
import { getUser } from "../hooks/login.actions";

const Profile = () => {
	const user = getUser();

	if (!user) {
		return <div className="p-8">No user data found.</div>;
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-colorOne via-colorSix to-colorTwo md:ml-56">
			<div className="bg-white/80 rounded-xl shadow-lg p-8 mt-20 w-full max-w-md">
				<h1 className="text-3xl font-bold mb-4 text-colorOne">Profile</h1>
				<p className="mb-2 text-lg"><span className="font-semibold">Name:</span> {user.name || "-"}</p>
				<p className="mb-2 text-lg"><span className="font-semibold">Username:</span> {user.username}</p>
				<p className="mb-2 text-lg"><span className="font-semibold">Email:</span> {user.email}</p>
			</div>
		</div>
	);
};

export default Profile; 