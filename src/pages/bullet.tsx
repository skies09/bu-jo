import React, { useEffect, useState, useRef } from "react";
import {
	useBulletApi,
	Bullet,
	RATING_FIELDS,
	RATING_SCALE,
	FieldHistory,
} from "../hooks/bullet.actions";

// Helper function to format dates
const formatDate = (dateString: string): string => {
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString();
	} catch (error) {
		return dateString;
	}
};

// Helper function to get month name
const getMonthName = (date: Date): string => {
	return date.toLocaleDateString("en-US", { month: "short" });
};

// Helper function to get days in month
const getDaysInMonth = (year: number, month: number): number => {
	return new Date(year, month + 1, 0).getDate();
};

// Helper function to get day of week (0 = Sunday, 1 = Monday, etc.)
const getDayOfWeek = (date: Date): number => {
	return date.getDay();
};

const BulletPage: React.FC = () => {
	const {
		fetchBullets,
		createBullet,
		updateBullet,
		deleteBullet,
		getFieldHistory,
		loading,
		error,
	} = useBulletApi();

	const [bullets, setBullets] = useState<Bullet[]>([]);
	const [selectedField, setSelectedField] = useState("day_rating");
	const [fieldHistory, setFieldHistory] = useState<FieldHistory | null>(null);
	const [showEntryForm, setShowEntryForm] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [formSuccess, setFormSuccess] = useState<string | null>(null);

	// Ref for scrolling to form
	const formRef = useRef<HTMLDivElement>(null);

	// Form state
	const [formData, setFormData] = useState({
		date: new Date().toISOString().split("T")[0],
		day_rating: 3,
		mood: 3,
		anxiety: 3,
		eating_habits: 3,
	});

	// Helper function to get color for rating
	const getRatingColor = (rating: number): string => {
		// For anxiety, reverse the colors since lower is better
		if (selectedField === "anxiety") {
			switch (rating) {
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
		switch (rating) {
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

	// Helper function to get button color for a specific field
	const getButtonColor = (fieldKey: string, rating: number): string => {
		// For anxiety, reverse the colors since lower is better
		if (fieldKey === "anxiety") {
			switch (rating) {
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
		switch (rating) {
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

	// Load bullets and field history on mount
	useEffect(() => {
		loadData();
	}, []);

	// Load field history when selected field changes
	useEffect(() => {
		loadFieldHistory();
	}, [selectedField]);

	const loadData = async () => {
		try {
			const res = await fetchBullets();
			const bulletsData = Array.isArray(res)
				? res
				: (res as { results?: Bullet[] }).results || [];
			setBullets(bulletsData);
		} catch (err) {
			console.error("Error loading bullets:", err);
		}
	};

	const loadFieldHistory = async () => {
		try {
			console.log("Loading field history for field:", selectedField);
			const history = await getFieldHistory(selectedField, 365);
			console.log("Field history response:", history);
			console.log("Field history data:", history.data);
			setFieldHistory(history);
		} catch (err) {
			console.error("Error loading field history:", err);
		}
	};

	// Handle form input changes
	const handleInputChange = (
		field: keyof typeof formData,
		value: string | number
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// Start editing existing entry
	const startEdit = (bullet: Bullet) => {
		console.log("Starting edit for bullet:", bullet);
		console.log("Bullet ID:", bullet.id);
		console.log("Bullet data:", {
			date: bullet.date,
			day_rating: bullet.day_rating,
			mood: bullet.mood,
			anxiety: bullet.anxiety,
			eating_habits: bullet.eating_habits,
		});

		setEditingId(bullet.id);
		setFormData({
			date: bullet.date,
			day_rating: bullet.day_rating,
			mood: bullet.mood,
			anxiety: bullet.anxiety,
			eating_habits: bullet.eating_habits,
		});
		setShowEntryForm(true);
		setFormError(null);
		setFormSuccess(null);

		console.log("Form should now be visible and populated");

		// Scroll to form after a short delay to ensure it's rendered
		setTimeout(() => {
			formRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}, 100);
	};

	// Cancel form
	const cancelForm = () => {
		setShowEntryForm(false);
		setEditingId(null);
		setFormData({
			date: new Date().toISOString().split("T")[0],
			day_rating: 3,
			mood: 3,
			anxiety: 3,
			eating_habits: 3,
		});
		setFormError(null);
		setFormSuccess(null);
	};

	// Delete entry
	const handleDelete = async (id: string) => {
		if (!window.confirm("Are you sure you want to delete this entry?")) {
			return;
		}

		try {
			await deleteBullet(id);
			setBullets((prev) => prev.filter((bullet) => bullet.id !== id));
			await loadFieldHistory();
			setFormSuccess("Entry deleted successfully!");
		} catch (err) {
			setFormError("Failed to delete entry.");
		}
	};

	// Submit form
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);
		setFormSuccess(null);

		console.log("Submitting form with data:", formData);
		console.log("Editing ID:", editingId);
		console.log("Form data type check:", {
			date: typeof formData.date,
			day_rating: typeof formData.day_rating,
			mood: typeof formData.mood,
			anxiety: typeof formData.anxiety,
			eating_habits: typeof formData.eating_habits,
		});

		try {
			if (editingId) {
				// Update existing
				console.log("Updating existing entry...");
				const updated = await updateBullet(editingId, formData);
				console.log("Updated entry:", updated);
				setBullets((prev) =>
					prev.map((bullet) =>
						bullet.id === editingId ? updated : bullet
					)
				);
				setFormSuccess("Entry updated successfully!");
			} else {
				// Create new
				console.log("Creating new entry...");
				console.log("Sending data to API:", formData);
				const created = await createBullet(formData);
				console.log("Created entry response:", created);
				console.log("Created entry type:", typeof created);
				console.log("Created entry keys:", Object.keys(created || {}));

				// Update bullets state
				setBullets((prev) => {
					const newBullets = [created, ...prev];
					console.log("Updated bullets array:", newBullets);
					return newBullets;
				});
				setFormSuccess("Entry created successfully!");
			}

			// Reload field history to update the grid
			console.log("Reloading field history...");
			await loadFieldHistory();
			console.log("Field history reloaded");

			cancelForm();
		} catch (err: any) {
			console.error("Error submitting form:", err);
			console.error("Error details:", {
				message: err.message,
				response: err.response?.data,
				status: err.response?.status,
			});
			setFormError("Failed to save entry.");
		}
	};

	// Generate grid data for the selected field
	const generateGridData = () => {
		if (!fieldHistory) return { months: [], days: [], grid: {} };

		const today = new Date();
		const months: string[] = [];
		const days: number[] = [];
		const grid: { [key: string]: number } = {};

		// Create a map of date to rating from field history
		const dateMap = new Map<string, number>();
		fieldHistory.data.forEach((item) => {
			dateMap.set(item.date, item.rating);
		});

		// Generate months starting from January of current year
		const currentYear = today.getFullYear();
		for (let month = 0; month < 12; month++) {
			const date = new Date(currentYear, month, 1);
			months.push(getMonthName(date));
		}

		// Generate day numbers (1-31)
		for (let day = 1; day <= 31; day++) {
			days.push(day);
		}

		// Populate grid with data
		fieldHistory.data.forEach((item) => {
			grid[item.date] = item.rating;
		});

		return { months, days, grid };
	};

	const { months, days, grid } = generateGridData();

	return (
		<div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-gray-50">
			<div className="pl-0 md:pl-56 flex justify-center items-center w-full">
				<div className="flex flex-col items-center justify-start pt-16 min-h-screen w-full">
					<div className="w-full max-w-6xl mx-auto p-6 space-y-6">
						{/* Header */}
						<div className="text-center">
							<h1 className="text-3xl font-bold text-neutral-800 mb-2">
								Daily Ratings
							</h1>
							<p className="text-neutral-600">
								Track your daily mood, anxiety, and habits
							</p>
						</div>

						{/* Add Rating Button */}
						<div className="flex justify-center">
							<button
								onClick={() => setShowEntryForm(true)}
								className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors duration-200"
							>
								Add Today's Rating
							</button>
						</div>

						{formError && (
							<div className="text-error-600 mb-4 bg-error-50 p-3 rounded border border-error-200">
								{formError}
							</div>
						)}
						{formSuccess && (
							<div className="text-success-600 mb-4 bg-success-50 p-3 rounded border border-success-200">
								{formSuccess}
							</div>
						)}

						{/* Entry Form */}
						{showEntryForm && (
							<div
								ref={formRef}
								className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-neutral-200"
							>
								<h3 className="text-xl font-bold text-neutral-800 mb-4">
									{editingId
										? "Edit Rating"
										: "Add Today's Rating"}
								</h3>

								<form
									onSubmit={handleSubmit}
									className="space-y-4"
								>
									<div>
										<label className="block font-semibold mb-2 text-neutral-700">
											Date
										</label>
										<input
											type="date"
											value={formData.date}
											onChange={(e) =>
												handleInputChange(
													"date",
													e.target.value
												)
											}
											className="w-full border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
											required
										/>
									</div>

									{RATING_FIELDS.map((field) => (
										<div key={field.key}>
											<label className="block font-semibold mb-2 text-neutral-700">
												{field.label}
											</label>
											<p className="text-sm text-neutral-500 mb-2">
												{field.description}
											</p>
											<div className="flex gap-2">
												{RATING_SCALE.map((scale) => (
													<button
														key={scale.value}
														type="button"
														onClick={() =>
															handleInputChange(
																field.key as keyof typeof formData,
																scale.value
															)
														}
														className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors duration-200 ${
															formData[
																field.key as keyof typeof formData
															] === scale.value
																? "ring-2 ring-primary-500"
																: ""
														}`}
														style={{
															backgroundColor:
																getButtonColor(
																	field.key,
																	scale.value
																),
															color:
																scale.value <= 2
																	? "white"
																	: "black",
														}}
													>
														{scale.value}
													</button>
												))}
											</div>
										</div>
									))}

									<div className="flex gap-2">
										<button
											type="submit"
											disabled={loading}
											className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-60 transition-colors duration-200"
										>
											{loading
												? "Saving..."
												: editingId
												? "Update"
												: "Save"}
										</button>
										<button
											type="button"
											onClick={cancelForm}
											className="bg-neutral-300 hover:bg-neutral-400 text-neutral-800 font-semibold px-4 py-2 rounded shadow transition-colors duration-200"
										>
											Cancel
										</button>
									</div>
								</form>
							</div>
						)}

						{/* Field Selection */}
						<div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-neutral-200">
							<h3 className="text-xl font-bold text-neutral-800 mb-4">
								View History
							</h3>
							<div className="flex flex-wrap gap-2">
								{RATING_FIELDS.map((field) => (
									<button
										key={field.key}
										onClick={() =>
											setSelectedField(field.key)
										}
										className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
											selectedField === field.key
												? "bg-primary-600 text-white"
												: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
										}`}
									>
										{field.label}
									</button>
								))}
							</div>
						</div>

						{/* Rating Grid */}
						{fieldHistory && (
							<div className="bg-white rounded-lg shadow-lg p-6 border border-neutral-200">
								<h3 className="text-xl font-bold text-neutral-800 mb-4">
									{fieldHistory.field
										.replace("_", " ")
										.replace(/\b\w/g, (l) =>
											l.toUpperCase()
										)}{" "}
									History
								</h3>

								<div className="flex gap-6">
									{/* Grid */}
									<div className="flex-1 overflow-x-auto">
										<div
											className="grid gap-1"
											style={{
												gridTemplateColumns: `auto repeat(${months.length}, 1fr)`,
											}}
										>
											{/* Empty corner */}
											<div className="w-8 h-8"></div>

											{/* Month headers */}
											{months.map((month, index) => (
												<div
													key={index}
													className="text-center text-sm font-semibold text-neutral-700 py-2"
												>
													{month}
												</div>
											))}

											{/* Day rows */}
											{days.map((day) => (
												<React.Fragment key={day}>
													{/* Day number */}
													<div className="text-right text-sm text-neutral-600 pr-2 py-1 flex items-center justify-end">
														{day}
													</div>

													{/* Month columns */}
													{months.map(
														(month, monthIndex) => {
															const currentYear =
																new Date().getFullYear();
															const targetDate =
																new Date(
																	currentYear,
																	monthIndex,
																	day
																);
															// Fix timezone issue by using local date formatting
															const dateStr = `${targetDate.getFullYear()}-${String(
																targetDate.getMonth() +
																	1
															).padStart(
																2,
																"0"
															)}-${String(
																targetDate.getDate()
															).padStart(
																2,
																"0"
															)}`;
															const rating =
																grid[dateStr];

															// Check if this day exists in this month
															const daysInMonth =
																getDaysInMonth(
																	targetDate.getFullYear(),
																	targetDate.getMonth()
																);
															const dayExists =
																day <=
																daysInMonth;

															if (!dayExists) {
																return (
																	<div
																		key={`${day}-${monthIndex}`}
																		className="w-6 h-6"
																	></div>
																);
															}

															return (
																<div
																	key={`${day}-${monthIndex}`}
																	className="w-6 h-6 rounded border border-neutral-200"
																	style={{
																		backgroundColor:
																			rating
																				? getRatingColor(
																						rating
																				  )
																				: "#f3f4f6",
																	}}
																	title={`${dateStr}: ${
																		rating ||
																		"No data"
																	}`}
																/>
															);
														}
													)}
												</React.Fragment>
											))}
										</div>
									</div>

									{/* Legend */}
									<div className="w-48">
										<h4 className="font-semibold text-neutral-800 mb-3">
											Rating Scale
										</h4>
										<div className="space-y-2">
											{selectedField === "anxiety" ? (
												// Reversed scale for anxiety
												<>
													<div className="flex items-center gap-2">
														<div
															className="w-4 h-4 rounded border border-neutral-200"
															style={{
																backgroundColor:
																	"#3b82f6",
															}}
														/>
														<span className="text-sm text-neutral-700">
															1: Very Low Anxiety
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div
															className="w-4 h-4 rounded border border-neutral-200"
															style={{
																backgroundColor:
																	"#22c55e",
															}}
														/>
														<span className="text-sm text-neutral-700">
															2: Low Anxiety
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div
															className="w-4 h-4 rounded border border-neutral-200"
															style={{
																backgroundColor:
																	"#eab308",
															}}
														/>
														<span className="text-sm text-neutral-700">
															3: Medium Anxiety
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div
															className="w-4 h-4 rounded border border-neutral-200"
															style={{
																backgroundColor:
																	"#f97316",
															}}
														/>
														<span className="text-sm text-neutral-700">
															4: High Anxiety
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div
															className="w-4 h-4 rounded border border-neutral-200"
															style={{
																backgroundColor:
																	"#ef4444",
															}}
														/>
														<span className="text-sm text-neutral-700">
															5: Very High Anxiety
														</span>
													</div>
												</>
											) : (
												// Normal scale for other fields
												<>
													{RATING_SCALE.map(
														(scale) => (
															<div
																key={
																	scale.value
																}
																className="flex items-center gap-2"
															>
																<div
																	className="w-4 h-4 rounded border border-neutral-200"
																	style={{
																		backgroundColor:
																			scale.color,
																	}}
																/>
																<span className="text-sm text-neutral-700">
																	{
																		scale.value
																	}
																	:{" "}
																	{
																		scale.label
																	}
																</span>
															</div>
														)
													)}
												</>
											)}
											<div className="flex items-center gap-2">
												<div className="w-4 h-4 rounded border border-neutral-200 bg-neutral-100" />
												<span className="text-sm text-neutral-700">
													No data
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Recent Entries */}
						{bullets.length > 0 && (
							<div className="bg-white rounded-lg shadow-lg p-6 border border-neutral-200">
								<h3 className="text-xl font-bold text-neutral-800 mb-4">
									Recent Entries
								</h3>
								<div className="space-y-3">
									{bullets.slice(0, 10).map((bullet) => (
										<div
											key={bullet.id}
											className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
										>
											<div className="flex items-center gap-4">
												<span className="font-semibold text-neutral-800">
													{formatDate(bullet.date)}
												</span>
												<div className="flex gap-2">
													{RATING_FIELDS.map(
														(field) => (
															<div
																key={field.key}
																className="flex items-center gap-1"
															>
																<span className="text-xs text-neutral-600">
																	{
																		field.label
																	}
																	:
																</span>
																<div
																	className="w-3 h-3 rounded"
																	style={{
																		backgroundColor:
																			getRatingColor(
																				bullet[
																					field.key as keyof Bullet
																				] as number
																			),
																	}}
																/>
															</div>
														)
													)}
												</div>
											</div>
											<div className="flex gap-2">
												<button
													onClick={() =>
														startEdit(bullet)
													}
													className="text-primary-600 hover:text-primary-700 text-sm font-medium"
												>
													Edit
												</button>
												<button
													onClick={() =>
														handleDelete(bullet.id)
													}
													className="text-error-600 hover:text-error-700 text-sm font-medium"
												>
													Delete
												</button>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default BulletPage;
