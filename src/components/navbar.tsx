import React, { useState } from "react";
import { Link } from "react-router-dom";

export const UserIcon = () => (
	<svg
		className="w-7 h-7"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<circle cx="12" cy="8" r="4" strokeWidth="2" />
		<path strokeWidth="2" d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4" />
	</svg>
);
export const NotificationIcon = () => (
	<svg
		className="w-7 h-7"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			strokeWidth="2"
			d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
		/>
	</svg>
);
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
			<div className="hidden md:fixed md:flex md:flex-col md:w-56 md:h-screen md:bg-colorTwo md:justify-between md:items-center md:py-8 md:z-50">
				{/* Nav Links */}
				<nav className="flex flex-col space-y-6 w-full items-center flex-1 pt-16">
					{navLinks.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className="text-colorOne hover:text-colorTwo font-poppins font-semibold text-lg w-full text-center py-2"
						>
							{link.label}
						</Link>
					))}
				</nav>
			</div>

			{/* Mobile Top Menu */}
			<div className="md:hidden w-full h-12 bg-colorTwo fixed top-0 z-50 flex items-center justify-between px-2">
				{/* Hamburger */}
				<button
					onClick={() => setIsOpen(!isOpen)}
					className="text-colorOne focus:outline-none"
				>
					<HamburgerIcon open={isOpen} />
				</button>
				{/* Logo Centered */}
				<Link
					to="/"
					className="absolute left-1/2 transform -translate-x-1/2 font-satisfy text-2xl font-bold text-colorOne tracking-wider drop-shadow-md"
				>
					BuJo
				</Link>
				{/* Icons Right */}
			</div>

			{/* Mobile Slide-out Menu */}
			{isOpen && (
				<div className="md:hidden fixed top-16 left-0 w-full bg-colorTwo shadow-lg z-40 animate-slide-down">
					{navLinks.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className="block px-4 py-4 text-colorOne hover:text-colorTwo font-poppins font-semibold text-lg border-b border-colorOne"
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
