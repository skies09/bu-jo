import React, { useState, useEffect, useRef } from "react";
import { useMotivationApi, ImageBoard, ImageBoardItem } from "../hooks/motivation.actions";

const MotivationPage: React.FC = () => {
	const {
		fetchImageBoards,
		createImageBoard,
		getImageBoard,
		updateImageBoard,
		deleteImageBoard,
		addImageToBoard,
		updateImage,
		deleteImage,
		reorderImages,
		loading,
		error,
	} = useMotivationApi();

	const [boards, setBoards] = useState<ImageBoard[]>([]);
	const [selectedBoard, setSelectedBoard] = useState<ImageBoard | null>(null);
	const [showCreateBoard, setShowCreateBoard] = useState(false);
	const [showAddImage, setShowAddImage] = useState(false);
	const [showEditBoard, setShowEditBoard] = useState(false);
	const [editingImage, setEditingImage] = useState<ImageBoardItem | null>(null);
	const [selectedImageSlot, setSelectedImageSlot] = useState<number | null>(null);
	const [editingImageId, setEditingImageId] = useState<string | null>(null);
	const [editingImageOrder, setEditingImageOrder] = useState<number | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [formSuccess, setFormSuccess] = useState<string | null>(null);

	// Form refs
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Form states
	const [boardForm, setBoardForm] = useState({
		title: "",
		description: "",
	});

	const [editBoardForm, setEditBoardForm] = useState({
		title: "",
		description: "",
	});

	const [imageForm, setImageForm] = useState({
		image: null as File | null,
		caption: "",
	});

	// Load boards on mount
	useEffect(() => {
		loadBoards();
	}, []);

	const loadBoards = async () => {
		try {
			const data = await fetchImageBoards();
			setBoards(data || []);
		} catch (err) {
			console.error("Error loading boards:", err);
			setBoards([]);
		}
	};

	const handleBoardSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);
		setFormSuccess(null);

		try {
			const newBoard = await createImageBoard(boardForm);
			setBoards(prev => [...prev, newBoard]);
			setBoardForm({ title: "", description: "" });
			setShowCreateBoard(false);
			setFormSuccess("Board created successfully!");
		} catch (err) {
			setFormError("Failed to create board.");
		}
	};

	const handleEditBoardSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedBoard) return;

		setFormError(null);
		setFormSuccess(null);

		// Use public_id if available, otherwise fall back to id
		const boardId = selectedBoard.public_id || selectedBoard.id;
		
		if (!boardId) {
			setFormError("Board ID not found. Please try again.");
			return;
		}

		try {
			const updatedBoard = await updateImageBoard(boardId, editBoardForm);
			
			// Update the selected board
			setSelectedBoard(prev => prev ? { ...prev, ...updatedBoard } : null);
			
			// Update boards list
			setBoards(prev => prev.map(board => 
				(board.public_id || board.id) === boardId
					? { ...board, ...updatedBoard }
					: board
			));

			setShowEditBoard(false);
			setFormSuccess("Board updated successfully!");
		} catch (err) {
			setFormError("Failed to update board.");
		}
	};

	const handleImageSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedBoard || !imageForm.image) return;

		setFormError(null);
		setFormSuccess(null);

		// Use public_id if available, otherwise fall back to id
		const boardId = selectedBoard.public_id || selectedBoard.id;
		
		// Debug logging
		console.log("Selected board:", selectedBoard);
		console.log("Board ID being used:", boardId);
		
		if (!boardId) {
			setFormError("Board ID not found. Please try again.");
			return;
		}

		try {
			let newImage;
			
			if (editingImageId) {
				// For editing, we can only update the caption since the API doesn't support file replacement
				newImage = await updateImage(editingImageId, {
					caption: imageForm.caption || undefined,
					order: editingImageOrder || undefined,
				});
			} else {
				// Add new image
				newImage = await addImageToBoard(boardId, {
					image: imageForm.image,
					caption: imageForm.caption || undefined,
					order: selectedImageSlot || undefined,
				});
			}

			// Refresh the board data to get the correct order assignments
			const refreshedBoard = await fetchImageBoards();
			const updatedBoard = refreshedBoard.find(board => 
				(board.public_id || board.id) === boardId
			);
			
			// Get the full board data with images
			const fullBoard = await getImageBoard(boardId);
			
			if (fullBoard) {
				setSelectedBoard(fullBoard);
				setBoards(refreshedBoard);
			}

			setImageForm({ image: null, caption: "" });
			setShowAddImage(false);
			setEditingImageId(null);
			setEditingImageOrder(null);
			setFormSuccess(editingImageId ? "Caption updated successfully!" : "Image added successfully!");
		} catch (err) {
			setFormError(editingImageId ? "Failed to update caption." : "Failed to add image.");
		}
	};

	const handleImageDelete = async (imageId: string) => {
		if (!selectedBoard || !window.confirm("Are you sure you want to delete this image?")) {
			return;
		}

		// Use public_id if available, otherwise fall back to id
		const boardId = selectedBoard.public_id || selectedBoard.id;

		try {
			await deleteImage(imageId);
			
			// Refresh the board data after deletion
			const refreshedBoard = await fetchImageBoards();
			
			// Get the full board data with images
			const fullBoard = await getImageBoard(boardId);
			
			if (fullBoard) {
				setSelectedBoard(fullBoard);
				setBoards(refreshedBoard);
			}

			setFormSuccess("Image deleted successfully!");
		} catch (err) {
			setFormError("Failed to delete image.");
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageForm(prev => ({ ...prev, image: file }));
		}
	};

	const openEditBoard = (board: ImageBoard) => {
		setSelectedBoard(board);
		setEditBoardForm({
			title: board.title,
			description: board.description || "",
		});
		setShowEditBoard(true);
	};

	const loadBoardWithImages = async (board: ImageBoard) => {
		try {
			const boardId = board.public_id || board.id;
			if (boardId) {
				const fullBoard = await getImageBoard(boardId);
				setSelectedBoard(fullBoard);
			}
		} catch (err) {
			console.error("Error loading board with images:", err);
			// Fallback to the board without images
			setSelectedBoard(board);
		}
	};

	const handleImageEdit = (image: ImageBoardItem) => {
		setEditingImageId(image.public_id);
		setEditingImageOrder(image.order);
		setImageForm({
			image: null,
			caption: image.caption || "",
		});
		setShowAddImage(true);
	};

	return (
		<div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
			<div className="pl-0 md:pl-56 flex justify-center items-center w-full">
				<div className="flex flex-col items-center justify-start pt-16 min-h-screen w-full">
					<div className="w-full max-w-7xl mx-auto p-6 space-y-6">
						{/* Header */}
						<div className="text-center mb-8">
							<h1 className="text-4xl font-bold text-gray-800 mb-2">
								{selectedBoard ? selectedBoard.title : "Image Boards"}
							</h1>
							<p className="text-gray-600 text-lg">
								{selectedBoard 
									? selectedBoard.description || "Your motivational image collection"
									: "Create and organize your motivational image collections"
								}
							</p>
						</div>

						{/* Back Button and Edit Button for Board View */}
						{selectedBoard && (
							<div className="flex justify-between items-center mb-6">
								<button
									onClick={() => setSelectedBoard(null)}
									className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
								>
									<i className="fas fa-arrow-left"></i>
									Back to Boards
								</button>
								<button
									onClick={() => openEditBoard(selectedBoard)}
									className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
								>
									<i className="fas fa-edit"></i>
									Edit Board
								</button>
							</div>
						)}

						{/* Error and Success Messages */}
						{formError && (
							<div className="text-red-600 mb-4 bg-red-50 p-3 rounded border border-red-200">
								{formError}
							</div>
						)}
						{formSuccess && (
							<div className="text-green-600 mb-4 bg-green-50 p-3 rounded border border-green-200">
								{formSuccess}
							</div>
						)}

						{/* Main Content - Boards List or Bento Grid */}
						{!selectedBoard ? (
							<>
								{/* Create Board Button */}
								{boards && boards.length < 3 && (
									<div className="flex justify-center mb-6">
										<button
											onClick={() => setShowCreateBoard(true)}
											className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors duration-200"
										>
											Create New Board
										</button>
									</div>
								)}

								{/* Image Boards Grid */}
								{loading ? (
									<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
										{[1, 2, 3].map((i) => (
											<div
												key={i}
												className="flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 text-lg font-medium text-gray-600 h-64"
											>
												<div className="flex items-center space-x-2">
													<div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
													<span>Loading...</span>
												</div>
											</div>
										))}
									</div>
								) : boards && boards.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
										{boards?.map((board, index) => (
																						<div
												key={board.public_id}
												className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer relative"
												onClick={() => loadBoardWithImages(board)}
											>
												{/* Arrow in top right corner */}
												<div className="absolute top-4 right-4 text-blue-600 text-lg">
													<i className="fas fa-arrow-right"></i>
												</div>

												{/* Card Content */}
												<div className="p-8 flex flex-col items-center justify-center min-h-[200px]">
													{/* Title */}
													<h3 className="text-xl font-bold text-gray-800 text-center mb-4">
														{board.title}
													</h3>
													
													{/* Separator line if there's a description */}
													{board.description && (
														<div className="w-16 h-px bg-gray-300 mb-4"></div>
													)}
													
													{/* Description */}
													{board.description && (
														<p className="text-gray-600 text-sm text-center max-w-xs">
															{board.description}
														</p>
													)}
												</div>
											</div>
										))}
									</div>
								) : (
							<div className="text-center py-12">
								<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-12 max-w-md mx-auto">
									<div className="text-6xl mb-4"><i className="fas fa-clipboard-list"></i></div>
									<h3 className="text-xl font-bold text-gray-800 mb-2">No Image Boards Yet</h3>
									<p className="text-gray-600 mb-6">Create your first image board to start organizing your motivational images!</p>
									<button
										onClick={() => setShowCreateBoard(true)}
										className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors duration-200"
									>
										Create Your First Board
									</button>
								</div>
							</div>
						)}
					</>
				) : selectedBoard ? (
					/* Bento Grid Layout for Selected Board */
					<div className="w-full">
						{/* Debug: Log selected board data */}
						{(() => {
							console.log("Selected board data:", selectedBoard);
							console.log("Selected board images:", selectedBoard.images);
							return null;
						})()}
						
						{/* Bento Grid */}
						<div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
							{/* Generate 8 image slots */}
							{Array.from({ length: 8 }, (_, index) => {
								const images = Array.isArray(selectedBoard.images) ? selectedBoard.images : [];
								// Try to find image by order first, then fallback to index
								let image = images.find(img => Number(img.order) === index + 1);
								if (!image && images[index]) {
									// Fallback: use image at this index if no order match
									image = images[index];
								}
								const isEmpty = !image;
								
								// Debug logging for first few slots
								if (index < 3) {
									console.log(`Slot ${index + 1}:`, {
										image,
										isEmpty,
										allImages: images,
										imageOrders: images.map(img => ({ id: img.public_id, order: img.order }))
									});
								}
								
								return (
									<div
										key={index}
										className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 ${
											isEmpty 
												? `bg-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 ${
													(images.length < 8) 
														? 'cursor-pointer' 
														: 'cursor-not-allowed opacity-50'
												  }` 
												: 'bg-white shadow-lg hover:shadow-xl cursor-default'
										}`}
										onClick={() => {
											console.log("Slot clicked:", index + 1);
											console.log("Is empty:", isEmpty);
											console.log("Can add image:", selectedBoard.can_add_image);
											console.log("Image count:", images.length);
											console.log("Selected board:", selectedBoard);
											
											// Always allow clicking if slot is empty and we have fewer than 8 images
											if (isEmpty && images.length < 8) {
												setSelectedImageSlot(index + 1);
												setShowAddImage(true);
											}
										}}
									>
										{isEmpty ? (
											<div className={`flex flex-col items-center justify-center h-full transition-colors duration-200 ${
												(images.length < 8)
													? 'text-gray-400 hover:text-blue-500'
													: 'text-gray-300'
											}`}>
												<i className="fas fa-plus text-2xl mb-2"></i>
												<span className="text-sm font-medium">
													{(images.length < 8)
														? 'Add Image'
														: 'Board Full'
													}
												</span>
											</div>
										) : image ? (
											<>
												<img
													src={image.image_url}
													alt={image.caption || "Board image"}
													className="w-full h-full object-cover cursor-pointer"
													onClick={() => image && handleImageEdit(image)}
												/>
												{image.caption && (
													<div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm">
														{image.caption}
													</div>
												)}
												<div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
													<button
														onClick={(e) => {
															e.stopPropagation();
															if (image) {
																handleImageDelete(image.public_id);
															}
														}}
														className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-xs"
													>
														×
													</button>
												</div>
											</>
										) : (
											<div className="flex flex-col items-center justify-center h-full text-gray-400">
												<i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
												<span className="text-sm font-medium">Error loading image</span>
											</div>
										)}
									</div>
								);
							})}
						</div>
						

					</div>
				) : null}
			</div>
		</div>
	</div>

			{/* Create Board Modal */}
			{showCreateBoard && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
						<h3 className="text-xl font-bold text-gray-800 mb-4">Create New Board</h3>
						<form onSubmit={handleBoardSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Title *
								</label>
								<input
									type="text"
									value={boardForm.title}
									onChange={(e) => setBoardForm(prev => ({ ...prev, title: e.target.value }))}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Description
								</label>
								<textarea
									value={boardForm.description}
									onChange={(e) => setBoardForm(prev => ({ ...prev, description: e.target.value }))}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									rows={3}
								/>
							</div>
							<div className="flex gap-3">
								<button
									type="submit"
									disabled={loading}
									className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-60"
								>
									{loading ? "Creating..." : "Create Board"}
								</button>
								<button
									type="button"
									onClick={() => setShowCreateBoard(false)}
									className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Add Image Modal */}
			{showAddImage && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
						<h3 className="text-xl font-bold text-gray-800 mb-4">
							{editingImageId ? 'Edit Image Caption' : 'Add Image'} to "{selectedBoard?.title || 'Board'}"
							{(selectedImageSlot && !editingImageId) || (editingImageOrder && editingImageId) ? (
								<span className="block text-sm font-normal text-gray-600 mt-1">
									Slot {editingImageId ? editingImageOrder : selectedImageSlot}
								</span>
							) : null}
						</h3>
						<form onSubmit={handleImageSubmit} className="space-y-4">
							{!editingImageId && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Image *
									</label>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										onChange={handleFileChange}
										className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										required
									/>
								</div>
							)}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Caption
								</label>
								<input
									type="text"
									value={imageForm.caption}
									onChange={(e) => setImageForm(prev => ({ ...prev, caption: e.target.value }))}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									placeholder="Optional caption for the image"
								/>
							</div>
							<div className="flex gap-3">
								<button
									type="submit"
									disabled={loading || (!editingImageId && !imageForm.image)}
									className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-60"
								>
									{loading ? "Uploading..." : (editingImageId ? "Update Caption" : "Upload Image")}
								</button>
								<button
									type="button"
									onClick={() => {
										setShowAddImage(false);
										setEditingImageId(null);
										setEditingImageOrder(null);
										setImageForm({ image: null, caption: "" });
									}}
									className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 rounded-lg transition-colors duration-200"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}



			{/* Edit Board Modal */}
			{showEditBoard && selectedBoard && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
						<div className="p-6 border-b border-gray-200">
							<div className="flex justify-between items-center">
								<h3 className="text-xl font-bold text-gray-800">Edit Board</h3>
								<button
									onClick={() => setShowEditBoard(false)}
									className="text-gray-400 hover:text-gray-600 text-2xl"
								>
									×
								</button>
							</div>
						</div>
						
						<form onSubmit={handleEditBoardSubmit} className="p-6">
							<div className="space-y-4">
								<div>
									<label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
										Board Title
									</label>
									<input
										type="text"
										id="edit-title"
										value={editBoardForm.title}
										onChange={(e) => setEditBoardForm(prev => ({ ...prev, title: e.target.value }))}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder="Enter board title"
										required
									/>
								</div>
								
								<div>
									<label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
										Description (Optional)
									</label>
									<textarea
										id="edit-description"
										value={editBoardForm.description}
										onChange={(e) => setEditBoardForm(prev => ({ ...prev, description: e.target.value }))}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
										placeholder="Enter board description"
										rows={3}
									/>
								</div>
							</div>
							
							<div className="flex gap-3 mt-6">
								<button
									type="submit"
									className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
								>
									Update Board
								</button>
								<button
									type="button"
									onClick={() => setShowEditBoard(false)}
									className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default MotivationPage;
