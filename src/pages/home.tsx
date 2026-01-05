import React, { useEffect, useState } from "react";
import { getUser } from "../hooks/login.actions";
import { useBulletApi, BulletAverages } from "../hooks/bullet.actions";

const Home = () => {
	const user = getUser();
	const displayName = user?.name || user?.username || "to BuJo";
	const { getAverages } = useBulletApi();
	const [averages, setAverages] = useState<BulletAverages | null>(null);
	const [loading, setLoading] = useState(true);

	// Fetch averages on component mount
	useEffect(() => {
		const fetchAverages = async () => {
			try {
				const data = await getAverages();
				setAverages(data);
			} catch (error) {
				console.error("Failed to fetch averages:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchAverages();
	}, []); // Empty dependency array - only run once on mount

	// Helper function to get color for rating
	const getRatingColor = (rating: number, field: string): string => {
		// For anxiety, reverse the colors since lower is better
		if (field === "anxiety") {
			switch (Math.round(rating)) {
				case 1:
					return "#3b82f6"; // blue-500 (good)
				case 2:
					return "#22c55e"; // green-500 (good)
				case 3:
					return "#eab308"; // yellow-500 (neutral)
				case 4:
					return "#f97316"; // orange-500 (bad)
				case 5:
					return "#ef4444"; // red-500 (very bad)
				default:
					return "#f3f4f6"; // neutral-100
			}
		}

		// For other fields, use normal color mapping
		switch (Math.round(rating)) {
			case 1:
				return "#ef4444"; // red-500 (bad)
			case 2:
				return "#f97316"; // orange-500 (bad)
			case 3:
				return "#eab308"; // yellow-500 (neutral)
			case 4:
				return "#22c55e"; // green-500 (good)
			case 5:
				return "#3b82f6"; // blue-500 (very good)
			default:
				return "#f3f4f6"; // neutral-100
		}
	};

	// Define the averages data array
	const averagesData = [
		{ key: "day_rating", label: "Day Rating", value: averages?.day_rating },
		{ key: "mood", label: "Mood", value: averages?.mood },
		{ key: "anxiety", label: "Anxiety", value: averages?.anxiety },
		{
			key: "eating_habits",
			label: "Eating Habits",
			value: averages?.eating_habits,
		},
	];

	return (
		<div
			id="home"
			className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-colorThree via-colorSix to-colorTwo"
			style={{ minHeight: "100vh" }}
		>
			<div className="w-full px-4 md:px-8 mt-20 md:mt-0 box-border">
				<p className="text-3xl md:text-4xl font-poppins font-semibold text-colorFive mb-6 mt-8 md:mt-20 md:ml-56">
					Welcome{displayName ? `, ${displayName}` : " to BuJo"}
				</p>
				{/* Top Row: Grid of 4 (1x4 on desktop, 2x2 on mobile/tablet) */}
				<div className="mb-8 md:ml-56">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6 h-48 md:h-64">
						{loading
							? // Loading state
							  [1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className="flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 text-lg font-medium text-gray-600"
									>
										<div className="flex items-center space-x-2">
											<div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
											<span>Loading...</span>
										</div>
									</div>
							  ))
							: // Averages display
							  averagesData.map((item) => (
									<div
										key={item.key}
										className="group relative flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 p-6 overflow-hidden"
										style={{
											borderColor: item.value
												? `${getRatingColor(
														item.value,
														item.key
												  )}40`
												: "#e5e7eb",
										}}
									>
										{/* AVG badge in corner */}
										<div className="absolute top-3 right-3 z-20 bg-gray-800/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
											Average
										</div>

										{/* Background gradient overlay */}
										<div
											className="absolute inset-0 opacity-10 rounded-2xl"
											style={{
												background: item.value
													? `linear-gradient(135deg, ${getRatingColor(
															item.value,
															item.key
													  )}20, ${getRatingColor(
															item.value,
															item.key
													  )}10)`
													: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
											}}
										></div>

										{/* Content */}
										<div className="relative z-10 text-center">
											<div className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">
												{item.label}
											</div>
											<div
												className="text-4xl md:text-5xl font-bold"
												style={{
													color: item.value
														? getRatingColor(
																item.value,
																item.key
														  )
														: "#9ca3af",
												}}
											>
												{item.value
													? item.value.toFixed(1)
													: "N/A"}
											</div>

											{/* Rating indicator dots */}
											{item.value && (
												<div className="flex justify-center space-x-1 mt-3">
													{[1, 2, 3, 4, 5].map(
														(rating) => (
															<div
																key={rating}
																className={`w-2 h-2 rounded-full transition-colors duration-200 ${
																	rating <=
																	Math.round(
																		item.value!
																	)
																		? "opacity-100"
																		: "opacity-30"
																}`}
																style={{
																	backgroundColor:
																		getRatingColor(
																			rating,
																			item.key
																		),
																}}
															></div>
														)
													)}
												</div>
											)}
										</div>

										{/* Hover effect */}
										<div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
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
								className="group relative flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl hover:scale-105 transition-all duration-300 p-8 overflow-hidden"
							>
								{/* Background gradient overlay */}
								<div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-60 rounded-2xl"></div>

								{/* Content */}
								<div className="relative z-10 text-center">
									<div className="text-2xl font-bold text-gray-700 mb-2">
										Coming Soon
									</div>
									<div className="text-sm text-gray-500">
										Feature {i}
									</div>
								</div>

								{/* Hover effect */}
								<div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
