import React, { useState } from "react";
import { getUser } from "../hooks/login.actions";
import ProfileSection from "../components/profileComponents/ProfileSection";
import AffirmationSection from "../components/profileComponents/AffirmationSection";
import GratitudeSection from "../components/profileComponents/GratitudeSection";
import PassionSection from "../components/profileComponents/PassionSection";
import FavoriteSection from "../components/profileComponents/FavoriteSection";
import AboutSection from "../components/profileComponents/AboutSection";

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
			className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-gray-50"
			style={{ minHeight: "100vh" }}
		>
			<div className="pl-0 md:pl-56 flex justify-center items-center w-full">
				<div className="flex flex-col items-center justify-start pt-16 min-h-screen  w-full">
					{/* Tabs */}
					<div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-12 mb-8 w-full max-w-4xl px-2">
						{profileTabs.map((tab) => (
							<button
								key={tab.key}
								onClick={() => setActiveTab(tab.key)}
								className={
									`px-4 sm:px-6 py-2 rounded-t-lg font-semibold text-base sm:text-lg transition-colors duration-150 border-b-2 focus:outline-none flex-shrink` +
									(activeTab === tab.key
										? " bg-white text-primary-600 border-primary-500 shadow-lg"
										: " bg-white/60 text-neutral-600 border-transparent hover:bg-white hover:text-neutral-800")
								}
							>
								{tab.label}
							</button>
						))}
					</div>
					<div className="bg-white/90 backdrop-blur-sm rounded-b-xl p-8 w-full max-w-4xl min-h-[300px] shadow-lg border border-neutral-200">
						{activeTab === "profile" && <ProfileSection />}
						{activeTab === "about" && <AboutSection />}
						{activeTab === "affirmations" && <AffirmationSection />}
						{activeTab === "gratitude" && <GratitudeSection />}
						{activeTab === "passions" && <PassionSection />}
						{activeTab === "faves" && <FavoriteSection />}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
