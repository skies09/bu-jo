import React from "react";
import { Link } from "react-router-dom";
import { NotificationIcon, UserIcon } from "./navbar";

export default function TopNav() {
	return (
		<div className="w-full">
			{/* Top Bar */}
			<div className="fixed top-0 left-0 w-full h-14 bg-colorTwo flex items-center justify-between px-6 z-50 shadow-md">
				<Link
					to="/"
					className="font-satisfy text-2xl font-bold text-colorOne tracking-wider drop-shadow-md"
				>
					BuJo
				</Link>
				<div className="flex items-center space-x-4">
					<NotificationIcon />
					<UserIcon />
				</div>
			</div>
		</div>
	);
}
