import React, { useEffect, useState } from "react";
import { useDiaryApi } from "../hooks/diary.actions";

interface DiaryEntry {
	id: number;
	title: string;
	content: string;
	highlight: string;
	date_created: string;
	user_id: string;
	date?: string;
}

// Add a simple date picker using native input
const getDateString = (date: Date) => date.toISOString().slice(0, 10);
const today = new Date();
const todayString = getDateString(today);

const Diary = () => {
	const {
		fetchEntries,
		createEntry,
		updateEntry,
		deleteEntry,
		loading,
		error,
	} = useDiaryApi();
	const [entries, setEntries] = useState<DiaryEntry[]>([]);
	const [newTitle, setNewTitle] = useState("");
	const [newContent, setNewContent] = useState("");
	const [newHighlight, setNewHighlight] = useState("");
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editTitle, setEditTitle] = useState("");
	const [editContent, setEditContent] = useState("");
	const [editHighlight, setEditHighlight] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [formSuccess, setFormSuccess] = useState<string | null>(null);
	const [selectedDate, setSelectedDate] = useState<string>(todayString);
	const [filter, setFilter] = useState<string>("all");

	// Load entries on mount
	useEffect(() => {
		async function load() {
			try {
				const res = await fetchEntries();
				setEntries(
					Array.isArray(res)
						? res
						: (res as { results?: DiaryEntry[] }).results || []
				);
			} catch (err) {
				console.error(err);
			}
		}
		load();
	}, []);

	// Check if there's an entry for the selected date
	const hasEntryForDate = (dateStr: string) =>
		entries.some((entry) => {
			const entryDate = entry.date || entry.date_created.slice(0, 10);
			return entryDate === dateStr;
		});

	const getEntryForDate = (dateStr: string) =>
		entries.find((entry) => {
			const entryDate = entry.date || entry.date_created.slice(0, 10);
			return entryDate === dateStr;
		});

	// Handle new entry submit
	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);
		setFormSuccess(null);
		if (!newTitle.trim() || !newContent.trim() || !newHighlight.trim()) {
			setFormError("Entry is required.");
			return;
		}
		try {
			const created = await createEntry({
				title: newTitle.trim(),
				content: newContent.trim(),
				highlight: newHighlight.trim(),
				date: selectedDate,
			});
			setEntries((prev) => [created, ...prev]);
			setNewTitle("");
			setNewContent("");
			setNewHighlight("");
			setFormSuccess("Entry added!");
		} catch (err) {
			setFormError("Failed to create entry.");
		}
	};

	// Start editing an entry
	const startEditing = (entry: DiaryEntry) => {
		setEditingId(entry.id);
		setEditTitle(entry.title);
		setEditContent(entry.content);
		setEditHighlight(entry.highlight);
	};

	// Cancel editing
	const cancelEditing = () => {
		setEditingId(null);
		setEditTitle("");
		setEditContent("");
		setEditHighlight("");
		setFormError(null);
	};

	// Save edits
	const saveEdit = async (id: number) => {
		if (!editTitle.trim() || !editContent.trim()) {
			setFormError("Title and content are required.");
			return;
		}

		try {
			const updated = await updateEntry(id, {
				title: editTitle.trim(),
				content: editContent.trim(),
				highlight: editHighlight.trim(),
			});
			setEntries((prev) =>
				prev.map((entry) => (entry.id === id ? updated : entry))
			);
			cancelEditing();
		} catch {
			setFormError("Failed to update entry.");
		}
	};

	// Delete entry
	const handleDelete = async (id: number) => {
		if (!window.confirm("Are you sure you want to delete this entry?"))
			return;
		try {
			await deleteEntry(id);
			setEntries((prev) => prev.filter((entry) => entry.id !== id));
			setFormSuccess("");
		} catch {
			alert("Failed to delete entry.");
		}
	};

	// Filtering logic for past entries
	const filterEntries = () => {
		if (filter === "all") return entries;
		const now = new Date();
		let fromDate: Date;
		if (filter === "week") {
			fromDate = new Date(now);
			fromDate.setDate(now.getDate() - 7);
		} else if (filter === "month") {
			fromDate = new Date(now);
			fromDate.setMonth(now.getMonth() - 1);
		} else if (filter === "3months") {
			fromDate = new Date(now);
			fromDate.setMonth(now.getMonth() - 3);
		} else {
			return entries;
		}
		return entries.filter((entry) => {
			const entryDate = new Date(entry.date || entry.date_created);
			return entryDate >= fromDate;
		});
	};

	return (
		<div
			id="diary"
			className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-colorThree via-colorSix to-colorTwo"
			style={{ minHeight: "100vh" }}
		>
			<div className="pl-56 flex justify-center items-center">
				<div className="mx-auto p-4 md:p-8">
					<h2 className="text-3xl font-bold mb-6 text-center">
						Diary
					</h2>

					{/* Date Picker */}
					<div className="flex items-center gap-2 mb-6">
						<label
							htmlFor="date-picker"
							className="font-medium flex items-center gap-1"
						>
							<span>Select Date:</span>
						</label>
						<input
							type="date"
							id="date-picker"
							value={selectedDate}
							onChange={(e) => setSelectedDate(e.target.value)}
							max={todayString}
							className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
					</div>

					{/* Add Entry Form for selected date if no entry exists */}
					{!hasEntryForDate(selectedDate) && (
						<form
							onSubmit={handleCreate}
							className="bg-white rounded-lg shadow p-6 mb-8 flex flex-col gap-4"
						>
							<h3 className="text-xl font-semibold mb-2">
								Add Entry for {selectedDate}
							</h3>
							{formError && (
								<p className="text-red-500 text-sm">
									{formError}
								</p>
							)}
							{formSuccess && (
								<p className="text-green-600 text-sm">
									{formSuccess}
								</p>
							)}
							<input
								type="text"
								placeholder="Title"
								value={newTitle}
								onChange={(e) => setNewTitle(e.target.value)}
								className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
							/>
							<textarea
								placeholder="Content"
								value={newContent}
								onChange={(e) => setNewContent(e.target.value)}
								className="border rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-400"
							/>
							<textarea
								placeholder="Highlight"
								value={newHighlight}
								onChange={(e) =>
									setNewHighlight(e.target.value)
								}
								className="border rounded px-3 py-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-400"
							/>
							<button
								type="submit"
								disabled={loading}
								className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-60"
							>
								{loading ? "Saving..." : "Add Entry"}
							</button>
						</form>
					)}

					{/* View entry for selected date if exists */}
					{hasEntryForDate(selectedDate) && (
						<div className="bg-white rounded-lg shadow p-6 mb-8">
							<h3 className="text-lg font-semibold mb-2">
								Entry for {selectedDate}
							</h3>
							<p className="mb-1">
								<span className="font-semibold">Title:</span>{" "}
								{getEntryForDate(selectedDate)?.title}
							</p>
							<p className="mb-2">
								<span className="font-semibold">Content:</span>{" "}
								{getEntryForDate(selectedDate)?.content}
							</p>
							<p className="mb-2">
								<span className="font-semibold">
									Highlight:
								</span>{" "}
								{getEntryForDate(selectedDate)?.highlight}
							</p>
							<small className="text-gray-500">
								Created:{" "}
								{new Date(
									getEntryForDate(selectedDate)
										?.date_created || ""
								).toLocaleString()}
							</small>
						</div>
					)}

					{/* Filter Buttons */}
					<div className="flex gap-2 mb-6 justify-center flex-wrap">
						{[
							{ label: "Hide", value: "hide" },
							{ label: "Last Week", value: "week" },
							{ label: "Last Month", value: "month" },
							{ label: "Last 3 Months", value: "3months" },
						].map((btn) => (
							<button
								key={btn.value}
								onClick={() => setFilter(btn.value)}
								className={`px-4 py-2 rounded font-medium shadow-sm border transition-colors duration-150 ${
									filter === btn.value
										? "bg-blue-500 text-white border-blue-500"
										: "bg-white text-blue-500 border-blue-300 hover:bg-blue-50"
								}`}
								disabled={filter === btn.value}
							>
								{btn.label}
							</button>
						))}
					</div>

					{/* Entries list (filtered) */}
					{loading && (
						<p className="text-center text-blue-500">
							Loading diary entries...
						</p>
					)}
					{error && (
						<p className="text-center text-red-500">
							Error: {error}
						</p>
					)}
					{!loading &&
						filter !== "hide" &&
						filterEntries().length === 0 && (
							<p className="text-center text-gray-500">
								No diary entries found.
							</p>
						)}

					{filter !== "hide" && (
						<div className="flex flex-col gap-4">
							{filterEntries().map((entry) => (
								<div
									key={entry.id}
									className="bg-white rounded-lg shadow p-5 flex flex-col gap-2 relative"
								>
									<div className="flex items-center justify-between mb-1">
										<h3 className="text-lg font-semibold">
											{entry.title}
										</h3>
										<div className="flex gap-2">
											<button
												className="text-blue-400 hover:text-blue-600 transition-colors"
												title="Edit"
												onClick={() =>
													startEditing(entry)
												}
												disabled={loading}
											>
												Edit
											</button>
											<button
												className="text-red-400 hover:text-red-600 transition-colors"
												title="Delete"
												onClick={() =>
													handleDelete(entry.id)
												}
												disabled={loading}
											>
												Delete
											</button>
										</div>
									</div>
									{editingId === entry.id ? (
										<>
											<input
												type="text"
												value={editTitle}
												onChange={(e) =>
													setEditTitle(e.target.value)
												}
												className="border rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
											/>
											<textarea
												value={editContent}
												onChange={(e) =>
													setEditContent(
														e.target.value
													)
												}
												className="border rounded px-3 py-2 mb-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-400"
											/>
											<textarea
												value={editHighlight}
												onChange={(e) =>
													setEditHighlight(
														e.target.value
													)
												}
												className="border rounded px-3 py-2 mb-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-400"
											/>
											<div className="flex gap-2">
												<button
													onClick={() =>
														saveEdit(entry.id)
													}
													disabled={loading}
													className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-60"
												>
													Save
												</button>
												<button
													onClick={cancelEditing}
													disabled={loading}
													className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded shadow disabled:opacity-60"
												>
													Cancel
												</button>
											</div>
											{formError && (
												<p className="text-red-500 text-sm mt-1">
													{formError}
												</p>
											)}
										</>
									) : (
										<>
											<small className="text-gray-400">
												{new Date(
													entry.date_created
												).toLocaleString()}
											</small>
										</>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Diary;
