import React, { useState } from "react";
import { Link } from "react-router-dom";
import NavbarIcons from "./navbarIcons";

const HamburgerIcon = ({ open }: { open: boolean }) => (
	<svg
		className="w-8 h-8"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
		/>
	</svg>
);

const navLinks = [
	{ to: "/diary", label: "Diary" },
	{ to: "/bullet", label: "Bullet" },
	{ to: "/goals", label: "Goals" },
	{ to: "/plans", label: "Plans" },
	{ to: "/motivation", label: "Motivation" },
];

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			{/* Desktop Side Panel */}
			<div className="hidden md:fixed md:flex md:flex-col md:w-56 md:h-screen md:justify-between md:items-center md:py-8 md:z-50 shadow-2xl">
				{/* Nav Links */}
				<nav className="flex flex-col space-y-6 w-full items-center flex-1 pt-16">
					{navLinks.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className="text-colorSix hover:text-colorOne font-poppins font-semibold text-lg w-full text-center py-2"
						>
							{link.label}
						</Link>
					))}
				</nav>
			</div>

			{/* Mobile Top Menu */}
			<div className="md:hidden w-full h-16 fixed top-0 z-50 flex items-center justify-between px-2">
				{/* Hamburger */}
				<button
					onClick={() => setIsOpen(!isOpen)}
					className="text-colorSix focus:outline-none"
				>
					<HamburgerIcon open={isOpen} />
				</button>
				{/* Logo Centered */}
				<Link
					to="/home"
					className="absolute left-1/2 transform -translate-x-1/2 font-satisfy text-2xl font-bold text-colorSix tracking-wider drop-shadow-2xl"
				>
					BuJo
				</Link>
				{/* Icons Right */}
				<NavbarIcons />
			</div>

			{/* Mobile Slide-out Menu */}
			{isOpen && (
				<div className="md:hidden fixed top-16 left-0 w-full bg-colorSix bg-opacity-95 shadow-lg z-40 animate-slide-down">
					{navLinks.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className="block px-4 py-4 text-colorFive hover:text-colorOne font-poppins font-semibold text-lg border-b border-colorOne"
							onClick={() => setIsOpen(false)}
						>
							{link.label}
						</Link>
					))}
				</div>
			)}
		</>
	);
};

export default Navbar;
