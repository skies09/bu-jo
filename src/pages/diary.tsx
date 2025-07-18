import React, { useEffect, useState } from "react";
import { useDiaryApi } from "../hooks/diary.actions";

interface DiaryEntry {
	id: number;
	title: string;
	content: string;
	date_created: string;
	user_id: string;
	date?: string;
}

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
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editTitle, setEditTitle] = useState("");
	const [editContent, setEditContent] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	// Load entries on mount
	useEffect(() => {
		async function load() {
			try {
				const res = await fetchEntries();

				// If res is an array, use it directly, else try res.results if it exists
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

	// Check if there's an entry for today
	const todayString = new Date().toISOString().slice(0, 10);
	const hasTodayEntry = entries.some((entry) => {
		// Use either `date` or `date_created` depending on your data shape
		// Here we check date first, fallback to date_created (only date part)
		const entryDate = entry.date || entry.date_created.slice(0, 10);
		return entryDate === todayString;
	});

	// Handle new entry submit
	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		if (!newTitle.trim() || !newContent.trim()) {
			setFormError("Title and content are required.");
			return;
		}

		try {
			const created = await createEntry({
				title: newTitle.trim(),
				content: newContent.trim(),
				date: todayString,
			});
			setEntries((prev) => [created, ...prev]);
			setNewTitle("");
			setNewContent("");
		} catch (err) {
			setFormError("Failed to create entry.");
		}
	};

	// Start editing an entry
	const startEditing = (entry: DiaryEntry) => {
		setEditingId(entry.id);
		setEditTitle(entry.title);
		setEditContent(entry.content);
	};

	// Cancel editing
	const cancelEditing = () => {
		setEditingId(null);
		setEditTitle("");
		setEditContent("");
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
		} catch {
			alert("Failed to delete entry.");
		}
	};

	return (
		<div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
			<h2>Diary</h2>

			{/* Show new entry form only if no entry for today */}
			{hasTodayEntry && (
				<form onSubmit={handleCreate} style={{ marginBottom: 30 }}>
					<h3>Add New Entry</h3>
					{formError && <p style={{ color: "red" }}>{formError}</p>}
					<input
						type="text"
						placeholder="Title"
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
						style={{ width: "100%", padding: 8, marginBottom: 10 }}
					/>
					<textarea
						placeholder="Content"
						value={newContent}
						onChange={(e) => setNewContent(e.target.value)}
						style={{
							width: "100%",
							padding: 8,
							marginBottom: 10,
							minHeight: 100,
						}}
					/>
					<button type="submit" disabled={loading}>
						{loading ? "Saving..." : "Add Entry"}
					</button>
				</form>
			)}

			{/* Loading or error */}
			{loading && <p>Loading diary entries...</p>}
			{error && <p style={{ color: "red" }}>Error: {error}</p>}

			{/* Entries list */}
			{!loading && entries.length === 0 && <p>No diary entries found.</p>}

			<div>
				{entries.map((entry) => (
					<div
						key={entry.id}
						style={{
							border: "1px solid #ccc",
							borderRadius: 4,
							padding: 15,
							marginBottom: 15,
						}}
					>
						{editingId === entry.id ? (
							<>
								<input
									type="text"
									value={editTitle}
									onChange={(e) =>
										setEditTitle(e.target.value)
									}
									style={{ width: "100%", marginBottom: 8 }}
								/>
								<textarea
									value={editContent}
									onChange={(e) =>
										setEditContent(e.target.value)
									}
									style={{ width: "100%", minHeight: 80 }}
								/>
								<div style={{ marginTop: 8 }}>
									<button
										onClick={() => saveEdit(entry.id)}
										disabled={loading}
									>
										Save
									</button>{" "}
									<button
										onClick={cancelEditing}
										disabled={loading}
									>
										Cancel
									</button>
								</div>
							</>
						) : (
							<>
								<h3>{entry.title}</h3>
								<p>{entry.content}</p>
								<small>
									Created:{" "}
									{new Date(
										entry.date_created
									).toLocaleString()}
								</small>
								<div style={{ marginTop: 8 }}>
									<button
										onClick={() => startEditing(entry)}
										disabled={loading}
									>
										Edit
									</button>{" "}
									<button
										onClick={() => handleDelete(entry.id)}
										disabled={loading}
									>
										Delete
									</button>
								</div>
							</>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default Diary;
