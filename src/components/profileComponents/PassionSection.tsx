import React, { useEffect, useState } from "react";
import { usePassionsApi, Passion } from "../../hooks/passions.actions";

// Helper function to format dates properly
const formatDate = (dateString: string): string => {
	try {
		// Try parsing as ISO string first
		const date = new Date(dateString);
		
		// Check if the date is valid
		if (isNaN(date.getTime())) {
			// If invalid, try parsing as timestamp
			const timestamp = parseInt(dateString);
			if (!isNaN(timestamp)) {
				return new Date(timestamp).toLocaleDateString();
			}
			// If still invalid, return a fallback
			return "Unknown date";
		}
		
		return date.toLocaleDateString();
	} catch (error) {
		console.error("Error parsing date:", dateString, error);
		return "Unknown date";
	}
};

const PassionSection: React.FC = () => {
	const {
		fetchPassions,
		createPassion,
		updatePassion,
		deletePassion,
		loading,
		error,
	} = usePassionsApi();
	
	const [passions, setPassions] = useState<Passion[]>([]);
	const [newText, setNewText] = useState("");
	const [newCategory, setNewCategory] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editText, setEditText] = useState("");
	const [editCategory, setEditCategory] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [formSuccess, setFormSuccess] = useState<string | null>(null);
	const [showAddForm, setShowAddForm] = useState(false);

	// Load passions on mount
	useEffect(() => {
		async function load() {
			try {
				const res = await fetchPassions();
				setPassions(
					Array.isArray(res)
						? res
						: (res as { results?: Passion[] }).results || []
				);
			} catch (err) {
				console.error(err);
			}
		}
		load();
	}, []); // Empty dependency array to prevent infinite loop

	// Handle new passion submit
	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);
		setFormSuccess(null);
		
		if (!newText.trim()) {
			setFormError("Passion text is required.");
			return;
		}
		
		try {
			const created = await createPassion({
				text: newText.trim(),
				category: newCategory.trim() || undefined,
				is_active: true,
			});
			setPassions((prev) => [created, ...prev]);
			setNewText("");
			setNewCategory("");
			setShowAddForm(false);
			setFormSuccess("Passion added!");
		} catch (err) {
			setFormError("Failed to create passion.");
		}
	};

	// Cancel editing
	const cancelEditing = () => {
		setEditingId(null);
		setEditText("");
		setEditCategory("");
		setFormError(null);
	};

	// Save edits
	const saveEdit = async (id: string) => {
		if (!editText.trim()) {
			setFormError("Passion text is required.");
			return;
		}

		try {
			const updated = await updatePassion(id, {
				text: editText.trim(),
				category: editCategory.trim() || undefined,
			});
			setPassions((prev) =>
				prev.map((passion) => 
					passion.id === id ? updated : passion
				)
			);
			cancelEditing();
			setFormSuccess("Passion updated!");
		} catch {
			setFormError("Failed to update passion.");
		}
	};

	// Delete passion
	const handleDelete = async (id: string) => {
		if (!window.confirm("Are you sure you want to delete this passion?"))
			return;
		try {
			await deletePassion(id);
			setPassions((prev) => prev.filter((passion) => passion.id !== id));
			setFormSuccess("Passion deleted!");
		} catch {
			setFormError("Failed to delete passion.");
		}
	};

	// Toggle passion active status
	const toggleActive = async (id: string, currentStatus: boolean) => {
		try {
			const updated = await updatePassion(id, {
				is_active: !currentStatus,
			});
			setPassions((prev) =>
				prev.map((passion) => 
					passion.id === id ? updated : passion
				)
			);
		} catch {
			setFormError("Failed to update passion status.");
		}
	};

	// Start editing
	const startEdit = (passion: Passion) => {
		setEditingId(passion.id);
		setEditText(passion.text);
		setEditCategory(passion.category || "");
		setFormError(null);
	};

	return (
		<div className="max-w-4xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-neutral-800">Passions</h2>
				<button
					onClick={() => setShowAddForm(!showAddForm)}
					className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded shadow transition-colors duration-200"
				>
					{showAddForm ? "Cancel" : "Add Passion"}
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

			{/* Add New Passion Form */}
			{showAddForm && (
				<div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-neutral-200">
					<h3 className="text-lg font-semibold mb-4 text-neutral-800">Add New Passion</h3>
					<form onSubmit={handleCreate} className="space-y-4">
						<div>
							<label className="block font-semibold mb-2 text-neutral-700">
								Passion Text *
							</label>
							<textarea
								value={newText}
								onChange={(e) => setNewText(e.target.value)}
								placeholder="What are you passionate about?"
								className="w-full border border-neutral-300 rounded px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								required
							/>
						</div>
						<div>
							<label className="block font-semibold mb-2 text-neutral-700">
								Category (optional)
							</label>
							<input
								type="text"
								value={newCategory}
								onChange={(e) => setNewCategory(e.target.value)}
								placeholder="e.g., Hobbies, Career, Learning, Creative"
								className="w-full border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
							/>
						</div>
						<div className="flex gap-2">
							<button
								type="submit"
								disabled={loading}
								className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-60 transition-colors duration-200"
							>
								{loading ? "Adding..." : "Add Passion"}
							</button>
							<button
								type="button"
								onClick={() => setShowAddForm(false)}
								className="bg-neutral-300 hover:bg-neutral-400 text-neutral-800 font-semibold px-4 py-2 rounded shadow transition-colors duration-200"
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Passions List */}
			{loading && (
				<p className="text-center text-primary-600 py-4">
					Loading passions...
				</p>
			)}
			
			{error && (
				<p className="text-center text-error-600 py-4">
					Error: {error}
				</p>
			)}

			{!loading && passions.length === 0 && (
				<div className="text-center py-8">
					<p className="text-neutral-500 mb-4">No passions yet. Discover what drives you by adding your first passion!</p>
				</div>
			)}

			<div className="space-y-4">
				{passions.map((passion) => (
					<div
						key={passion.id}
						className={`bg-white rounded-lg shadow-lg p-6 border transition-all duration-200 ${
							passion.is_active 
								? "border-primary-200" 
								: "border-neutral-200 opacity-60"
						}`}
					>
						{editingId === passion.id ? (
							// Edit Mode
							<div className="space-y-4">
								<div>
									<label className="block font-semibold mb-2 text-neutral-700">
										Passion Text *
									</label>
									<textarea
										value={editText}
										onChange={(e) => setEditText(e.target.value)}
										className="w-full border border-neutral-300 rounded px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
										required
									/>
								</div>
								<div>
									<label className="block font-semibold mb-2 text-neutral-700">
										Category
									</label>
									<input
										type="text"
										value={editCategory}
										onChange={(e) => setEditCategory(e.target.value)}
										className="w-full border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
									/>
								</div>
								<div className="flex gap-2">
									<button
										onClick={() => saveEdit(passion.id)}
										disabled={loading}
										className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-3 py-1 rounded shadow disabled:opacity-60 transition-colors duration-200"
									>
										Save
									</button>
									<button
										onClick={cancelEditing}
										className="bg-neutral-300 hover:bg-neutral-400 text-neutral-800 font-semibold px-3 py-1 rounded shadow transition-colors duration-200"
									>
										Cancel
									</button>
								</div>
							</div>
						) : (
							// View Mode
							<div>
								<div className="flex justify-between items-start mb-3">
									<div className="flex-1">
										<p className="text-lg text-neutral-800 mb-2">
											{passion.text}
										</p>
										{passion.category && (
											<span className="inline-block bg-primary-100 text-primary-700 text-sm px-2 py-1 rounded">
												{passion.category}
											</span>
										)}
									</div>
									<div className="flex items-center gap-2 ml-4">
										<button
											onClick={() => toggleActive(passion.id, passion.is_active)}
											className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
												passion.is_active
													? "bg-success-100 text-success-700 hover:bg-success-200"
													: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
											}`}
										>
											{passion.is_active ? "Active" : "Inactive"}
										</button>
									</div>
								</div>
								
								<div className="flex justify-between items-center">
									<small className="text-neutral-500">
										Created: {formatDate(passion.created)}
									</small>
									<div className="flex gap-2">
										<button
											onClick={() => startEdit(passion)}
											className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
										>
											Edit
										</button>
										<button
											onClick={() => handleDelete(passion.id)}
											className="text-error-600 hover:text-error-700 text-sm font-medium transition-colors duration-200"
										>
											Delete
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default PassionSection;
