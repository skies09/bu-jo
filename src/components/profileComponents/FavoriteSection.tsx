import React, { useEffect, useState } from "react";
import { useFavoritesApi, Favorite, CATEGORY_CHOICES } from "../../hooks/favorites.actions";

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

// Helper function to get placeholder text based on category
const getPlaceholderText = (category: string): string => {
	switch (category) {
		case 'song':
			return "song";
		case 'movie':
			return "movie";
		case 'book':
			return "book";
		case 'color':
			return "color";
		case 'season':
			return "season";
		case 'food':
			return "food";
		case 'place':
			return "place";
		case 'hobby':
			return "hobby";
		case 'other':
			return "thing";
		default:
			return "thing";
	}
};

const FavoriteSection: React.FC = () => {
	const {
		fetchFavorites,
		createFavorite,
		updateFavorite,
		deleteFavorite,
		loading,
		error,
	} = useFavoritesApi();
	
	const [favorites, setFavorites] = useState<Favorite[]>([]);
	const [newTitle, setNewTitle] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const [newCategory, setNewCategory] = useState("other");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editTitle, setEditTitle] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [editCategory, setEditCategory] = useState("other");
	const [formError, setFormError] = useState<string | null>(null);
	const [formSuccess, setFormSuccess] = useState<string | null>(null);
	const [showAddForm, setShowAddForm] = useState(false);

	// Load favorites on mount
	useEffect(() => {
		async function load() {
			try {
				const res = await fetchFavorites();
				setFavorites(
					Array.isArray(res)
						? res
						: (res as { results?: Favorite[] }).results || []
				);
			} catch (err) {
				console.error(err);
			}
		}
		load();
	}, []); // Empty dependency array to prevent infinite loop

	// Handle new favorite submit
	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);
		setFormSuccess(null);
		
		if (!newTitle.trim()) {
			setFormError("Title is required.");
			return;
		}
		
		try {
			const created = await createFavorite({
				title: newTitle.trim(),
				description: newDescription.trim() || undefined,
				category: newCategory,
				is_active: true,
			});
			setFavorites((prev) => [created, ...prev]);
			setNewTitle("");
			setNewDescription("");
			setNewCategory("other");
			setShowAddForm(false);
			setFormSuccess("Favorite added!");
		} catch (err) {
			setFormError("Failed to create favorite.");
		}
	};

	// Cancel editing
	const cancelEditing = () => {
		setEditingId(null);
		setEditTitle("");
		setEditDescription("");
		setEditCategory("other");
		setFormError(null);
	};

	// Save edits
	const saveEdit = async (id: string) => {
		if (!editTitle.trim()) {
			setFormError("Title is required.");
			return;
		}

		try {
			const updated = await updateFavorite(id, {
				title: editTitle.trim(),
				description: editDescription.trim() || undefined,
				category: editCategory,
			});
			setFavorites((prev) =>
				prev.map((favorite) => 
					favorite.id === id ? updated : favorite
				)
			);
			cancelEditing();
			setFormSuccess("Favorite updated!");
		} catch {
			setFormError("Failed to update favorite.");
		}
	};

	// Delete favorite
	const handleDelete = async (id: string) => {
		if (!window.confirm("Are you sure you want to delete this favorite?"))
			return;
		try {
			await deleteFavorite(id);
			setFavorites((prev) => prev.filter((favorite) => favorite.id !== id));
			setFormSuccess("Favorite deleted!");
		} catch {
			setFormError("Failed to delete favorite.");
		}
	};

	// Toggle favorite active status
	const toggleActive = async (id: string, currentStatus: boolean) => {
		try {
			const updated = await updateFavorite(id, {
				is_active: !currentStatus,
			});
			setFavorites((prev) =>
				prev.map((favorite) => 
					favorite.id === id ? updated : favorite
				)
			);
		} catch {
			setFormError("Failed to update favorite status.");
		}
	};

	// Start editing
	const startEdit = (favorite: Favorite) => {
		setEditingId(favorite.id);
		setEditTitle(favorite.title);
		setEditDescription(favorite.description || "");
		setEditCategory(favorite.category);
		setFormError(null);
	};

	// Get category label from value
	const getCategoryLabel = (value: string): string => {
		const category = CATEGORY_CHOICES.find(cat => cat.value === value);
		return category ? category.label : value;
	};

	return (
		<div className="max-w-4xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-neutral-800">Favorite Things</h2>
				<button
					onClick={() => setShowAddForm(!showAddForm)}
					className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded shadow transition-colors duration-200"
				>
					{showAddForm ? "Cancel" : "Add Favorite"}
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

			{/* Add New Favorite Form */}
			{showAddForm && (
				<div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-neutral-200">
					<h3 className="text-lg font-semibold mb-4 text-neutral-800">Add New Favorite</h3>
					<form onSubmit={handleCreate} className="space-y-4">
						<div>
							<label className="block font-semibold mb-2 text-neutral-700">
								Category *
							</label>
							<select
								value={newCategory}
								onChange={(e) => setNewCategory(e.target.value)}
								className="w-full border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								required
							>
								{CATEGORY_CHOICES.map((category) => (
									<option key={category.value} value={category.value}>
										{category.label}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="block font-semibold mb-2 text-neutral-700">
								Title *
							</label>
							<input
								type="text"
								value={newTitle}
								onChange={(e) => setNewTitle(e.target.value)}
								placeholder={`What's your favorite ${getPlaceholderText(newCategory)}?`}
								className="w-full border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
								required
							/>
						</div>
						<div>
							<label className="block font-semibold mb-2 text-neutral-700">
								Description (optional)
							</label>
							<textarea
								value={newDescription}
								onChange={(e) => setNewDescription(e.target.value)}
								placeholder="Tell us more about why you love this..."
								className="w-full border border-neutral-300 rounded px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
							/>
						</div>
						<div className="flex gap-2">
							<button
								type="submit"
								disabled={loading}
								className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-60 transition-colors duration-200"
							>
								{loading ? "Adding..." : "Add Favorite"}
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

			{/* Favorites List */}
			{loading && (
				<p className="text-center text-primary-600 py-4">
					Loading favorites...
				</p>
			)}
			
			{error && (
				<p className="text-center text-error-600 py-4">
					Error: {error}
				</p>
			)}

			{!loading && favorites.length === 0 && (
				<div className="text-center py-8">
					<p className="text-neutral-500 mb-4">No favorites yet. Start collecting the things that bring you joy!</p>
				</div>
			)}

			<div className="space-y-4">
				{favorites.map((favorite) => (
					<div
						key={favorite.id}
						className={`bg-white rounded-lg shadow-lg p-6 border transition-all duration-200 ${
							favorite.is_active 
								? "border-primary-200" 
								: "border-neutral-200 opacity-60"
						}`}
					>
						{editingId === favorite.id ? (
							// Edit Mode
							<div className="space-y-4">
								<div>
									<label className="block font-semibold mb-2 text-neutral-700">
										Category *
									</label>
									<select
										value={editCategory}
										onChange={(e) => setEditCategory(e.target.value)}
										className="w-full border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
										required
									>
										{CATEGORY_CHOICES.map((category) => (
											<option key={category.value} value={category.value}>
												{category.label}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block font-semibold mb-2 text-neutral-700">
										Title *
									</label>
									<input
										type="text"
										value={editTitle}
										onChange={(e) => setEditTitle(e.target.value)}
										placeholder={`What's your favorite ${getPlaceholderText(editCategory)}?`}
										className="w-full border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
										required
									/>
								</div>
								<div>
									<label className="block font-semibold mb-2 text-neutral-700">
										Description
									</label>
									<textarea
										value={editDescription}
										onChange={(e) => setEditDescription(e.target.value)}
										className="w-full border border-neutral-300 rounded px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
									/>
								</div>
								<div className="flex gap-2">
									<button
										onClick={() => saveEdit(favorite.id)}
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
										<h3 className="text-lg font-semibold text-neutral-800 mb-2">
											{favorite.title}
										</h3>
										{favorite.description && (
											<p className="text-neutral-600 mb-2">
												{favorite.description}
											</p>
										)}
										<span className="inline-block bg-primary-100 text-primary-700 text-sm px-2 py-1 rounded">
											{getCategoryLabel(favorite.category)}
										</span>
									</div>
									<div className="flex items-center gap-2 ml-4">
										<button
											onClick={() => toggleActive(favorite.id, favorite.is_active)}
											className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
												favorite.is_active
													? "bg-success-100 text-success-700 hover:bg-success-200"
													: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
											}`}
										>
											{favorite.is_active ? "Active" : "Inactive"}
										</button>
									</div>
								</div>
								
								<div className="flex justify-between items-center">
									<small className="text-neutral-500">
										Created: {formatDate(favorite.created)}
									</small>
									<div className="flex gap-2">
										<button
											onClick={() => startEdit(favorite)}
											className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
										>
											Edit
										</button>
										<button
											onClick={() => handleDelete(favorite.id)}
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

export default FavoriteSection;
