import React from "react";
import { getUser } from "../hooks/login.actions";

const Home = () => {
	const user = getUser();
	const displayName = user?.name || user?.username || "to BuJo";
	return (
		<div
			id="home"
			className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-colorOne via-colorSix to-colorTwo overflow-x-hidden"
			style={{ minHeight: "100vh" }}
		>
			<div className="w-full px-4 md:px-8 mt-20 md:mt-0 box-border">
				<p className="text-3xl md:text-4xl font-poppins font-semibold text-colorTwo mb-6 mt-8 md:mt-20 md:ml-56">
					Welcome{displayName ? `, ${displayName}` : " to BuJo"}
				</p>
				{/* Top Row: Grid of 4 (1x4 on desktop, 2x2 on mobile/tablet) */}
				<div className="mb-8 md:ml-56">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6 h-40 md:h-60">
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className="flex items-center justify-center bg-white/30 rounded-xl shadow-lg text-xl font-semibold text-colorOne border-2 border-colorOne hover:bg-colorTwo hover:text-white transition-all duration-300"
							>
								Grid {i}
							</div>
						))}
					</div>
				</div>

				{/* Bottom Row: Grid of 3 (1x3 on desktop, 1x3 on mobile) */}
				<div className="md:ml-56">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-56 md:h-80">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="flex items-center justify-center bg-white/30 rounded-xl shadow-lg text-xl font-semibold text-colorOne border-2 border-colorOne hover:bg-colorTwo hover:text-white transition-all duration-300"
							>
								Bottom {i}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
