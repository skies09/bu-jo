import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// import { motion } from "framer-motion";

const Home = () => {
	return (
		<div id="home" className="w-screen overflow-hidden h-auto mt-4">
			<div className="flex justify-center items-center flex-col">
				<p className="text-xl font-poppins font-semibold text-colorTwo mb-2">
					Entries
				</p>
				<Link
					to="/diary"
					className="text-colorOne hover:text-colorTwo font-poppins font-semibold border-2 border-colorOne px-10 py-3 rounded-xl bg-colorTwo my-1"
				>
					Diary
				</Link>
			</div>
			<div className="flex justify-center items-center flex-col">
				<Link
					to="/bullet"
					className="text-colorOne hover:text-colorTwo font-poppins font-semibold border-2 border-colorOne px-10 py-3 rounded-xl bg-colorTwo my-1"
				>
					Bullet
				</Link>
			</div>
		</div>
	);
};

export default Home;
