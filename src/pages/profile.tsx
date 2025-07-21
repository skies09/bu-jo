import React, { useState } from "react";
import { getUser } from "../hooks/login.actions";

const profileTabs = [
	{ label: "Profile", key: "profile" },
	{ label: "About", key: "about" },
	{ label: "Affirmations", key: "affirmations" },
	{ label: "Gratitude", key: "gratitude" },
	{ label: "Passions", key: "passions" },
	{ label: "Faves", key: "faves" },
];

const Profile = () => {
	const user = getUser();
	const [activeTab, setActiveTab] = useState("profile");

	if (!user) {
		return <div className="p-8">No user data found.</div>;
	}

	return (
		<div
			id="profile"
			className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-colorOne via-colorSix to-colorTwo overflow-x-hidden"
			style={{ minHeight: "100vh" }}
		>
			<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-colorOne via-colorSix to-colorTwo md:ml-56 w-full">
				{/* Tabs */}
				<div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-12 mb-8 w-full max-w-4xl px-2">
					{profileTabs.map((tab) => (
						<button
							key={tab.key}
							onClick={() => setActiveTab(tab.key)}
							className={
								`px-4 sm:px-6 py-2 rounded-t-lg font-semibold text-base sm:text-lg transition-colors duration-150 border-b-2 focus:outline-none flex-shrink` +
								(activeTab === tab.key
									? " bg-white text-colorOne border-colorOne shadow"
									: " bg-white/60 text-gray-500 border-transparent hover:bg-white")
							}
						>
							{tab.label}
						</button>
					))}
				</div>
				<div className="bg-white/80 rounded-b-xl shadow-lg p-8 w-full max-w-4xl min-h-[300px]">
					{activeTab === "profile" && (
						<>
							<h1 className="text-3xl font-bold mb-4 text-colorOne">
								Profile
							</h1>
							<p className="mb-2 text-lg">
								<span className="font-semibold">Name:</span>{" "}
								{user.name || "-"}
							</p>
							<p className="mb-2 text-lg">
								<span className="font-semibold">Username:</span>{" "}
								{user.username}
							</p>
							<p className="mb-2 text-lg">
								<span className="font-semibold">Email:</span>{" "}
								{user.email}
							</p>
						</>
					)}
					{activeTab === "about" && (
						<>
							<h1 className="text-2xl font-bold mb-4 text-colorOne">
								About
							</h1>
							<p>About content goes here.</p>
						</>
					)}
					{activeTab === "affirmations" && (
						<>
							<h1 className="text-2xl font-bold mb-4 text-colorOne">
								Affirmations
							</h1>
							<p>Affirmations content goes here.</p>
						</>
					)}
					{activeTab === "gratitude" && (
						<>
							<h1 className="text-2xl font-bold mb-4 text-colorOne">
								Gratitude
							</h1>
							<p>Gratitude content goes here.</p>
						</>
					)}
					{activeTab === "passions" && (
						<>
							<h1 className="text-2xl font-bold mb-4 text-colorOne">
								Passions
							</h1>
							<p>Passions content goes here.</p>
						</>
					)}
					{activeTab === "faves" && (
						<>
							<h1 className="text-2xl font-bold mb-4 text-colorOne">
								Faves Map
							</h1>
							<p>Favourites map content goes here.</p>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default Profile;
