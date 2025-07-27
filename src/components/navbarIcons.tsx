import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, useLoginActions } from "../hooks/login.actions";

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

export default function NavbarIcons() {
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
		<div className="flex items-center space-x-4 relative" ref={dropdownRef}>
			<button
				// onClick={() => setDropdownOpen((open) => !open)}
				className="focus:outline-none text-colorFive"
			>
				<NotificationIcon />
			</button>
			<button
				onClick={() => setDropdownOpen((open) => !open)}
				className="focus:outline-none text-colorFive"
			>
				<UserIcon />
			</button>
			{dropdownOpen && (
				<div className="absolute right-0 top-8 mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-200">
					<button
						className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
						onClick={handleProfile}
					>
						View Profile
					</button>
					<button
						className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
						onClick={handleLogout}
					>
						Logout
					</button>
				</div>
			)}
		</div>
	);
}
