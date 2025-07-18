import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
	return (
		<div
			id="home"
			className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-colorOne via-colorSix to-colorTwo"
			style={{ minHeight: "100vh" }}
		>
			<div className="flex flex-col items-center justify-center w-full px-4 md:ml-56 mt-20 md:mt-0">
				<p className="text-3xl md:text-4xl font-poppins font-semibold text-colorTwo mb-6 mt-8 md:mt-20">
					Welcome to BuJo
				</p>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
					<Link
						to="/diary"
						className="text-colorOne hover:text-colorTwo font-poppins font-semibold border-2 border-colorOne px-10 py-6 rounded-xl bg-white/30 shadow-lg text-center text-xl transition-all duration-300 hover:bg-colorTwo hover:text-white"
					>
						Diary
					</Link>
					<Link
						to="/bullet"
						className="text-colorOne hover:text-colorTwo font-poppins font-semibold border-2 border-colorOne px-10 py-6 rounded-xl bg-white/30 shadow-lg text-center text-xl transition-all duration-300 hover:bg-colorTwo hover:text-white"
					>
						Bullet
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Home;
