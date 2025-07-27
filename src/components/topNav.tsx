import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getUser, useLoginActions } from "../hooks/login.actions";
import NavbarIcons from "./navbarIcons";

export default function TopNav() {
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const { logout } = useLoginActions();
	const user = getUser();

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleProfile = () => {
		setDropdownOpen(false);
		navigate("/profile");
	};

	const handleLogout = () => {
		setDropdownOpen(false);
		logout();
	};

	return (
		<div className="w-full hidden md:block">
			{/* Top Bar */}
			<div className="fixed top-0 left-0 w-full h-14 flex items-center justify-between px-6 z-50 shadow-2xl">
				<Link
					to="/home"
					className="font-satisfy text-2xl font-bold text-colorSix tracking-wider drop-shadow-2xl"
				>
					BuJo
				</Link>
				<NavbarIcons />
			</div>
		</div>
	);
}
