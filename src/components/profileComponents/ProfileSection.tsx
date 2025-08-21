import React, { useState, useRef, useEffect } from "react";
import { useLoginActions, getUser, User } from "../../hooks/login.actions";
import { setTheme } from "../../store/login/actions";
import { useDispatch } from "react-redux";

const themeOptions = [
	{ value: "cosy", label: "Cosy" },
	{ value: "elite", label: "Elite" },
	{ value: "auto", label: "Auto" },
];

const ProfileSection: React.FC = () => {
	// Only get user once on mount
	const [user, setUser] = useState<User | null>(() => getUser());
	const { edit } = useLoginActions();
	const dispatch = useDispatch();
	// Form state is initialized from user, but only updated when user changes
	const [form, setForm] = useState({
		name: user?.name || "",
		username: user?.username || "",
		email: user?.email || "",
		date_of_birth: user?.date_of_birth || "",
		theme: user?.theme || "auto",
		avatar: null as File | null,
	});
	const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
		user?.avatar || undefined
	);
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Sync form state with user only when user changes (not on every render)
	useEffect(() => {
		if (user) {
			setForm({
				name: user.name || "",
				username: user.username || "",
				email: user.email || "",
				date_of_birth: user.date_of_birth || "",
				theme: user.theme || "auto",
				avatar: null,
			});
			setAvatarPreview(user.avatar || undefined);
			// Set theme in Redux on mount
			dispatch(setTheme(user.theme || "auto"));
		}
	}, [user, dispatch]);

	if (!user) return <div>No user data found.</div>;

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value, type } = e.target;
		if (type === "file") {
			const file = (e.target as HTMLInputElement).files?.[0] || null;
			setForm((prev) => ({ ...prev, avatar: file }));
			if (file) {
				setAvatarPreview(URL.createObjectURL(file));
			}
		} else {
			setForm((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleEdit = () => {
		setEditing(true);
		setError(null);
		setSuccess(null);
	};

	const handleCancel = () => {
		setEditing(false);
		setError(null);
		setSuccess(null);
		// Reset form to last saved user state
		if (user) {
			setForm({
				name: user.name || "",
				username: user.username || "",
				email: user.email || "",
				date_of_birth: user.date_of_birth || "",
				theme: user.theme || "auto",
				avatar: null,
			});
			setAvatarPreview(user.avatar || undefined);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editing) return;
		setSaving(true);
		setError(null);
		setSuccess(null);
		try {
			const data = new FormData();
			// Only append editable fields
			data.append("name", form.name);
			data.append("username", form.username);
			data.append("email", form.email);
			data.append("date_of_birth", form.date_of_birth);
			data.append("theme", form.theme);
			if (form.avatar) data.append("avatar", form.avatar);
			// Do NOT append id or any read-only fields
			await edit(data, user.id);
			// Update local user state after successful edit
			setUser((prev) =>
				prev
					? {
							...prev,
							name: form.name,
							username: form.username,
							email: form.email,
							date_of_birth: form.date_of_birth,
							theme: form.theme,
							avatar: avatarPreview || undefined,
					  }
					: prev
			);
			// Update theme in Redux after save
			dispatch(setTheme(form.theme));
			setSuccess("Profile updated!");
			setEditing(false);
		} catch (err: any) {
			setError("Failed to update profile.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto">
			<h2 className="text-2xl font-bold mb-4">Profile</h2>
			{error && <div className="text-red-500 mb-2">{error}</div>}
			{success && <div className="text-green-600 mb-2">{success}</div>}
			{editing ? (
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex flex-col items-center mb-4">
						<div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-2">
							{avatarPreview ? (
								<img
									src={avatarPreview}
									alt="Avatar"
									className="object-cover w-full h-full"
								/>
							) : (
								<span className="text-gray-400 flex items-center justify-center w-full h-full">
									No Avatar
								</span>
							)}
						</div>
						<input
							type="file"
							name="avatar"
							accept="image/*"
							ref={fileInputRef}
							onChange={handleChange}
							className="mt-2"
						/>
					</div>
					<div>
						<label className="block font-semibold mb-1">Name</label>
						<input
							type="text"
							name="name"
							value={form.name}
							onChange={handleChange}
							className="border rounded px-3 py-2 w-full"
							disabled={!editing}
						/>
					</div>
					<div>
						<label className="block font-semibold mb-1">
							Username
						</label>
						<input
							type="text"
							name="username"
							value={form.username}
							onChange={handleChange}
							className="border rounded px-3 py-2 w-full"
							disabled={!editing}
						/>
					</div>
					<div>
						<label className="block font-semibold mb-1">
							Email
						</label>
						<input
							type="email"
							name="email"
							value={form.email}
							onChange={handleChange}
							className="border rounded px-3 py-2 w-full"
							disabled={!editing}
						/>
					</div>
					<div>
						<label className="block font-semibold mb-1">
							Date of Birth
						</label>
						<input
							type="date"
							name="date_of_birth"
							value={form.date_of_birth || ""}
							onChange={handleChange}
							className="border rounded px-3 py-2 w-full"
							disabled={!editing}
						/>
					</div>
					<div>
						<label className="block font-semibold mb-1">
							Theme
						</label>
						<select
							name="theme"
							value={form.theme}
							onChange={handleChange}
							className="border rounded px-3 py-2 w-full"
							disabled={!editing}
						>
							{themeOptions.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>
					<div className="flex gap-2 mt-4">
						<button
							type="submit"
							className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-60"
							disabled={saving}
						>
							{saving ? "Saving..." : "Save"}
						</button>
						<button
							type="button"
							className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded shadow"
							onClick={handleCancel}
							disabled={saving}
						>
							Cancel
						</button>
					</div>
				</form>
			) : (
				<div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
					<div className="flex flex-col items-center mb-6">
						<div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4 border-4 border-colorOne shadow">
							{avatarPreview ? (
								<img
									src={avatarPreview}
									alt="Avatar"
									className="object-cover w-full h-full"
								/>
							) : (
								<span className="text-gray-400 flex items-center justify-center w-full h-full">
									No Avatar
								</span>
							)}
						</div>
						<h3 className="text-2xl font-bold text-colorOne mb-1">
							{form.name}
						</h3>
						<div className="text-gray-500 text-lg">
							@{form.username}
						</div>
					</div>
					<div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6">
						<div className="text-gray-500 font-semibold">Email</div>
						<div className="text-colorFive font-medium break-all">
							{form.email}
						</div>
						<div className="text-gray-500 font-semibold">
							Date of Birth
						</div>
						<div className="text-colorFive font-medium">
							{form.date_of_birth || (
								<span className="italic text-gray-400">
									Not set
								</span>
							)}
						</div>
						<div className="text-gray-500 font-semibold">Theme</div>
						<div className="text-colorFive font-medium capitalize">
							{form.theme}
						</div>
					</div>
					<button
						type="button"
						className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded shadow text-lg"
						onClick={handleEdit}
					>
						Edit Profile
					</button>
				</div>
			)}
		</div>
	);
};

export default ProfileSection;
