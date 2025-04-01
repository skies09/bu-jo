import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="w-full h-16 bg-colorTwo fixed top-0 z-50">
			<div className="flex justify-between items-center h-full px-4 md:px-6">
				{/* Company Logo */}
				<div className="flex items-center">
					<Link
						to="/"
						className="font-satisfy text-xl font-bold text-colorOne tracking-wider drop-shadow-md"
					>
						BuJo
					</Link>
				</div>

				{/* Desktop Links */}
				<div className="hidden md:flex space-x-6">
					<Link
						to="/diary"
						className="text-colorOne hover:text-colorTwo font-poppins font-semibold"
					>
						Diary
					</Link>
					<Link
						to="/bullet"
						className="text-colorOne hover:text-colorTwo font-poppins font-semibold"
					>
						Bullet
					</Link>
					<Link
						to="/goals"
						className="text-colorOne hover:text-colorTwo font-poppins font-semibold"
					>
						Goals
					</Link>
					<Link
						to="/plans"
						className="text-colorOne hover:text-colorTwo font-poppins font-semibold"
					>
						Plans
					</Link>
					<Link
						to="/motivation"
						className="text-colorOne hover:text-colorTwo font-poppins font-semibold"
					>
						Motivation
					</Link>
				</div>

				{/* Hamburger Icon for Mobile */}
				<div className="md:hidden flex items-center">
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="text-colorOne focus:outline-none"
					>
						<svg
							className="w-8 h-8"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d={
									isOpen
										? "M6 18L18 6M6 6l12 12"
										: "M4 6h16M4 12h16M4 18h16"
								}
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{isOpen && (
				<div className="md:hidden bg-colorTwo">
					<Link
						to="/diary"
						className="block px-4 py-2 text-colorOne hover:text-colorTwo font-poppins font-semibold"
						onClick={() => setIsOpen(!isOpen)}
					>
						Diary
					</Link>
					<Link
						to="/bullet"
						className="block px-4 py-2 text-colorOne hover:text-colorTwo font-poppins font-semibold"
						onClick={() => setIsOpen(!isOpen)}
					>
						Bullet
					</Link>
					<Link
						to="/goals"
						className="block px-4 py-2 text-colorOne hover:text-colorTwo font-poppins font-semibold"
						onClick={() => setIsOpen(!isOpen)}
					>
						Goals
					</Link>
					<Link
						to="/plans"
						className="block px-4 py-2 text-colorOne hover:text-colorTwo font-poppins font-semibold"
						onClick={() => setIsOpen(!isOpen)}
					>
						Plans
					</Link>
					<Link
						to="/motivation"
						className="block px-4 py-2 text-colorOne hover:text-colorTwo font-poppins font-semibold"
						onClick={() => setIsOpen(!isOpen)}
					>
						Motivation
					</Link>
				</div>
			)}
		</div>
	);
};

export default Navbar;
