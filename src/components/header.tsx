// import { motion } from "framer-motion";

export default function Header() {
	return (
		<div className="w-screen overflow-hidden h-auto items-center justify-center flex py-8 bg-colorOne pt-24">
			<div className="relative flex flex-col justify-center items-center">
				<h1 className="font-satisfy text-2xl md:text-5xl font-bold text-colorTwo tracking-wider drop-shadow-md">
					BuJo
				</h1>
				<h2>Bullet journal</h2>
			</div>
		</div>
	);
}
