import React, { useEffect, useState } from "react";
import { useAboutApi, About } from "../../hooks/about.actions";

// Helper function to format dates properly
const formatDate = (dateString: string): string => {
	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			const timestamp = parseInt(dateString);
			if (!isNaN(timestamp)) {
				return new Date(timestamp).toLocaleDateString();
			}
			return "Unknown date";
		}
		return date.toLocaleDateString();
	} catch (error) {
		console.error("Error parsing date:", dateString, error);
		return "Unknown date";
	}
};

const AboutSection: React.FC = () => {
	const {
		fetchAbout,
		createAbout,
		updateAbout,
		deleteAbout,
		loading,
		error,
	} = useAboutApi();
	
	const [about, setAbout] = useState<About | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const [formSuccess, setFormSuccess] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("personal");

	// Form state
	const [formData, setFormData] = useState<Partial<About>>({
		nickname: "",
		location: "",
		occupation: "",
		education: "",
		personality_type: "",
		zodiac_sign: "",
		life_goals: "",
		personal_mission: "",
		hobbies: "",
		interests: "",
		lifestyle_preferences: "",
		personal_story: "",
		achievements: "",
		challenges_overcome: "",
		core_values: "",
		beliefs: "",
		philosophy: "",
		relationship_status: "",
		family_info: "",
		social_preferences: "",
		career_goals: "",
		skills: "",
		work_style: "",
		health_goals: "",
		fitness_preferences: "",
		wellness_practices: "",
		creative_interests: "",
		artistic_preferences: "",
		self_expression: "",
		bucket_list: "",
		dreams_aspirations: "",
		future_plans: "",
		notes: "",
		is_public: false,
	});

	// Load about data on mount
	useEffect(() => {
		async function load() {
			try {
				const data = await fetchAbout();
				setAbout(data);
				setFormData(data);
			} catch (err) {
				console.error(err);
			}
		}
		load();
	}, []);

	// Handle form input changes
	const handleInputChange = (field: keyof About, value: string | boolean) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	// Start editing
	const startEdit = () => {
		setIsEditing(true);
		setFormError(null);
		setFormSuccess(null);
	};

	// Cancel editing
	const cancelEdit = () => {
		setIsEditing(false);
		setFormData(about || {});
		setFormError(null);
		setFormSuccess(null);
	};

	// Save changes
	const saveChanges = async () => {
		setFormError(null);
		setFormSuccess(null);

		try {
			if (about) {
				// Update existing
				const updated = await updateAbout(about.id, formData);
				setAbout(updated);
				setFormData(updated);
			} else {
				// Create new
				const created = await createAbout(formData);
				setAbout(created);
				setFormData(created);
			}
			setIsEditing(false);
			setFormSuccess("About section saved successfully!");
		} catch (err) {
			setFormError("Failed to save about section.");
		}
	};

	// Delete about section
	const handleDelete = async () => {
		if (!about || !window.confirm("Are you sure you want to delete your about section? This action cannot be undone.")) {
			return;
		}
		
		try {
			await deleteAbout(about.id);
			setAbout(null);
			setFormData({});
			setIsEditing(false);
			setFormSuccess("About section deleted successfully!");
		} catch (err) {
			setFormError("Failed to delete about section.");
		}
	};

	// Tab sections
	const tabs = [
		{ key: "personal", label: "Personal Info", icon: "👤" },
		{ key: "background", label: "Background", icon: "📚" },
		{ key: "interests", label: "Interests", icon: "🎯" },
		{ key: "story", label: "Story", icon: "📖" },
		{ key: "values", label: "Values", icon: "💎" },
		{ key: "relationships", label: "Relationships", icon: "❤️" },
		{ key: "career", label: "Career", icon: "💼" },
		{ key: "health", label: "Health", icon: "🏃‍♀️" },
		{ key: "creative", label: "Creative", icon: "🎨" },
		{ key: "future", label: "Future", icon: "🚀" },
		{ key: "notes", label: "Notes", icon: "📝" },
	];

	// Render form field
	const renderField = (field: keyof About, label: string, type: "text" | "textarea" | "checkbox" = "text", placeholder?: string) => {
		// Handle boolean fields differently
		if (field === "is_public" || type === "checkbox") {
			return (
				<div className="mb-4">
					<label className="flex items-center">
						<input
							type="checkbox"
							checked={formData[field] as boolean || false}
							onChange={(e) => handleInputChange(field, e.target.checked)}
							className="mr-2"
							disabled={!isEditing}
						/>
						<span className="font-semibold text-neutral-700">{label}</span>
					</label>
				</div>
			);
		}

		// Handle string fields
		const stringValue = (formData[field] as string) || "";
		
		if (isEditing) {
			// Edit mode - show form inputs
			return (
				<div className="mb-4">
					<label className="block font-semibold mb-2 text-neutral-700">
						{label}
					</label>
					{type === "textarea" ? (
						<textarea
							value={stringValue}
							onChange={(e) => handleInputChange(field, e.target.value)}
							placeholder={placeholder}
							className="w-full border border-neutral-300 rounded px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
						/>
					) : (
						<input
							type="text"
							value={stringValue}
							onChange={(e) => handleInputChange(field, e.target.value)}
							placeholder={placeholder}
							className="w-full border border-neutral-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
						/>
					)}
				</div>
			);
		} else {
			// View mode - show as readable content
			if (!stringValue.trim()) {
				return null; // Don't show empty fields in view mode
			}
			
			return (
				<div className="mb-6">
					<h4 className="font-semibold text-neutral-800 mb-2">{label}</h4>
					<div className="text-neutral-700 leading-relaxed whitespace-pre-line">
						{stringValue}
					</div>
				</div>
			);
		}
	};

	return (
		<div className="max-w-6xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-neutral-800">About Me</h2>
				<div className="flex gap-2">
					{!isEditing ? (
						<button
							onClick={startEdit}
							className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded shadow transition-colors duration-200"
						>
							{about ? "Edit" : "Create About"}
						</button>
					) : (
						<>
							<button
								onClick={saveChanges}
								disabled={loading}
								className="bg-success-600 hover:bg-success-700 text-white font-semibold px-4 py-2 rounded shadow disabled:opacity-60 transition-colors duration-200"
							>
								{loading ? "Saving..." : "Save"}
							</button>
							<button
								onClick={cancelEdit}
								className="bg-neutral-300 hover:bg-neutral-400 text-neutral-800 font-semibold px-4 py-2 rounded shadow transition-colors duration-200"
							>
								Cancel
							</button>
						</>
					)}
				</div>
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

			{loading && (
				<p className="text-center text-primary-600 py-4">
					Loading about section...
				</p>
			)}

			{error && (
				<p className="text-center text-error-600 py-4">
					Error: {error}
				</p>
			)}

			{!loading && !about && !isEditing && (
				<div className="text-center py-8">
					<p className="text-neutral-500 mb-4">No about section yet. Create one to share your story!</p>
				</div>
			)}

			{/* Tabs */}
			<div className="flex flex-wrap gap-2 mb-6">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						onClick={() => setActiveTab(tab.key)}
						className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
							activeTab === tab.key
								? "bg-primary-600 text-white"
								: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
						}`}
					>
						<span className="mr-2">{tab.icon}</span>
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab Content */}
			<div className="bg-white rounded-lg shadow-lg p-6 border border-neutral-200">
				{activeTab === "personal" && (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-neutral-800 mb-4">Personal Information</h3>
						{isEditing ? (
							<>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{renderField("nickname", "Nickname", "text", "What do you like to be called?")}
									{renderField("location", "Location", "text", "Where are you based?")}
									{renderField("occupation", "Occupation", "text", "What do you do for work?")}
									{renderField("education", "Education", "text", "Your educational background")}
									{renderField("personality_type", "Personality Type", "text", "e.g., INTJ, ENFP, etc.")}
									{renderField("zodiac_sign", "Zodiac Sign", "text", "Your astrological sign")}
								</div>
								{renderField("life_goals", "Life Goals", "textarea", "What are your main life goals?")}
								{renderField("personal_mission", "Personal Mission", "textarea", "What's your personal mission statement?")}
							</>
						) : (
							<div className="space-y-6">
								{renderField("nickname", "Nickname")}
								{renderField("location", "Location")}
								{renderField("occupation", "Occupation")}
								{renderField("education", "Education")}
								{renderField("personality_type", "Personality Type")}
								{renderField("zodiac_sign", "Zodiac Sign")}
								{renderField("life_goals", "Life Goals", "textarea")}
								{renderField("personal_mission", "Personal Mission", "textarea")}
								{!formData.nickname && !formData.location && !formData.occupation && !formData.education && !formData.personality_type && !formData.zodiac_sign && !formData.life_goals && !formData.personal_mission && (
									<div className="text-center py-8 text-neutral-500">
										<p>No personal information added yet. Click "Edit" to get started!</p>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{activeTab === "background" && (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-neutral-800 mb-4">Background & Lifestyle</h3>
						{isEditing ? (
							<>
								{renderField("hobbies", "Hobbies", "textarea", "What do you enjoy doing in your free time?")}
								{renderField("interests", "Interests", "textarea", "What topics or subjects interest you?")}
								{renderField("lifestyle_preferences", "Lifestyle Preferences", "textarea", "How do you prefer to live your life?")}
							</>
						) : (
							<div className="space-y-6">
								{renderField("hobbies", "Hobbies", "textarea")}
								{renderField("interests", "Interests", "textarea")}
								{renderField("lifestyle_preferences", "Lifestyle Preferences", "textarea")}
								{!formData.hobbies && !formData.interests && !formData.lifestyle_preferences && (
									<div className="text-center py-8 text-neutral-500">
										<p>No background information added yet. Click "Edit" to get started!</p>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{activeTab === "interests" && (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-neutral-800 mb-4">Interests & Activities</h3>
						{isEditing ? (
							<>
								{renderField("creative_interests", "Creative Interests", "textarea", "What creative activities do you enjoy?")}
								{renderField("artistic_preferences", "Artistic Preferences", "textarea", "What types of art do you appreciate?")}
								{renderField("self_expression", "Self Expression", "textarea", "How do you express yourself?")}
							</>
						) : (
							<div className="space-y-6">
								{renderField("creative_interests", "Creative Interests", "textarea")}
								{renderField("artistic_preferences", "Artistic Preferences", "textarea")}
								{renderField("self_expression", "Self Expression", "textarea")}
								{!formData.creative_interests && !formData.artistic_preferences && !formData.self_expression && (
									<div className="text-center py-8 text-neutral-500">
										<p>No interests added yet. Click "Edit" to get started!</p>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{activeTab === "story" && (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-neutral-800 mb-4">Personal Story</h3>
						{isEditing ? (
							<>
								{renderField("personal_story", "Personal Story", "textarea", "Share your story, background, or journey...")}
								{renderField("achievements", "Achievements", "textarea", "What are you proud of accomplishing?")}
								{renderField("challenges_overcome", "Challenges Overcome", "textarea", "What challenges have you faced and overcome?")}
							</>
						) : (
							<div className="space-y-6">
								{renderField("personal_story", "Personal Story", "textarea")}
								{renderField("achievements", "Achievements", "textarea")}
								{renderField("challenges_overcome", "Challenges Overcome", "textarea")}
								{!formData.personal_story && !formData.achievements && !formData.challenges_overcome && (
									<div className="text-center py-8 text-neutral-500">
										<p>No personal story added yet. Click "Edit" to get started!</p>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{activeTab === "values" && (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-neutral-800 mb-4">Values & Beliefs</h3>
						{isEditing ? (
							<>
								{renderField("core_values", "Core Values", "textarea", "What are your core values?")}
								{renderField("beliefs", "Beliefs", "textarea", "What do you believe in?")}
								{renderField("philosophy", "Personal Philosophy", "textarea", "What's your life philosophy?")}
							</>
						) : (
							<div className="space-y-6">
								{renderField("core_values", "Core Values", "textarea")}
								{renderField("beliefs", "Beliefs", "textarea")}
								{renderField("philosophy", "Personal Philosophy", "textarea")}
								{!formData.core_values && !formData.beliefs && !formData.philosophy && (
									<div className="text-center py-8 text-neutral-500">
										<p>No values & beliefs added yet. Click "Edit" to get started!</p>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{activeTab === "relationships" && (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-neutral-800 mb-4">Relationships & Social</h3>
						{isEditing ? (
							<>
								{renderField("relationship_status", "Relationship Status", "text", "Your current relationship status")}
								{renderField("family_info", "Family Information", "textarea", "Tell us about your family")}
								{renderField("social_preferences", "Social Preferences", "textarea", "How do you prefer to socialize?")}
							</>
						) : (
							<div className="space-y-6">
								{renderField("relationship_status", "Relationship Status")}
								{renderField("family_info", "Family Information", "textarea")}
								{renderField("social_preferences", "Social Preferences", "textarea")}
								{!formData.relationship_status && !formData.family_info && !formData.social_preferences && (
									<div className="text-center py-8 text-neutral-500">
										<p>No relationship information added yet. Click "Edit" to get started!</p>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{activeTab === "career" && (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-neutral-800 mb-4">Career & Professional</h3>
						{isEditing ? (
							<>
								{renderField("career_goals", "Career Goals", "textarea", "What are your professional aspirations?")}
								{renderField("skills", "Skills", "textarea", "What are your key skills and talents?")}
								{renderField("work_style", "Work Style", "textarea", "How do you prefer to work?")}
							</>
						) : (
							<div className="space-y-6">
								{renderField("career_goals", "Career Goals", "textarea")}
								{renderField("skills", "Skills", "textarea")}
								{renderField("work_style", "Work Style", "textarea")}
								{!formData.career_goals && !formData.skills && !formData.work_style && (
									<div className="text-center py-8 text-neutral-500">
										<p>No career information added yet. Click "Edit" to get started!</p>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{activeTab === "health" && (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-neutral-800 mb-4">Health & Wellness</h3>
						{isEditing ? (
							<>
								{renderField("health_goals", "Health Goals", "textarea", "What are your health and wellness goals?")}
								{renderField("fitness_preferences", "Fitness Preferences", "textarea", "How do you like to stay active?")}
								{renderField("wellness_practices", "Wellness Practices", "textarea", "What wellness practices do you follow?")}
							</>
						) : (
							<div className="space-y-6">
								{renderField("health_goals", "Health Goals", "textarea")}
								{renderField("fitness_preferences", "Fitness Preferences", "textarea")}
								{renderField("wellness_practices", "Wellness Practices", "textarea")}
								{!formData.health_goals && !formData.fitness_preferences && !formData.wellness_practices && (
									<div className="text-center py-8 text-neutral-500">
										<p>No health information added yet. Click "Edit" to get started!</p>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{activeTab === "creative" && (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-neutral-800 mb-4">Creative & Expression</h3>
						{isEditing ? (
							<>
								{renderField("creative_interests", "Creative Interests", "textarea", "What creative activities do you enjoy?")}
								{renderField("artistic_preferences", "Artistic Preferences", "textarea", "What types of art do you appreciate?")}
								{renderField("self_expression", "Self Expression", "textarea", "How do you express yourself?")}
							</>
						) : (
							<div className="space-y-6">
								{renderField("creative_interests", "Creative Interests", "textarea")}
								{renderField("artistic_preferences", "Artistic Preferences", "textarea")}
								{renderField("self_expression", "Self Expression", "textarea")}
								{!formData.creative_interests && !formData.artistic_preferences && !formData.self_expression && (
									<div className="text-center py-8 text-neutral-500">
										<p>No creative information added yet. Click "Edit" to get started!</p>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{activeTab === "future" && (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-neutral-800 mb-4">Future & Dreams</h3>
						{isEditing ? (
							<>
								{renderField("bucket_list", "Bucket List", "textarea", "What's on your bucket list?")}
								{renderField("dreams_aspirations", "Dreams & Aspirations", "textarea", "What are your biggest dreams?")}
								{renderField("future_plans", "Future Plans", "textarea", "What are your plans for the future?")}
							</>
						) : (
							<div className="space-y-6">
								{renderField("bucket_list", "Bucket List", "textarea")}
								{renderField("dreams_aspirations", "Dreams & Aspirations", "textarea")}
								{renderField("future_plans", "Future Plans", "textarea")}
								{!formData.bucket_list && !formData.dreams_aspirations && !formData.future_plans && (
									<div className="text-center py-8 text-neutral-500">
										<p>No future plans added yet. Click "Edit" to get started!</p>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{activeTab === "notes" && (
					<div className="space-y-4">
						<h3 className="text-xl font-bold text-neutral-800 mb-4">Additional Notes</h3>
						{isEditing ? (
							<>
								{renderField("notes", "Notes", "textarea", "Any additional notes or thoughts...")}
								{renderField("is_public", "Make this profile public", "checkbox")}
							</>
						) : (
							<div className="space-y-6">
								{renderField("notes", "Notes", "textarea")}
								{renderField("is_public", "Profile Visibility", "checkbox")}
								{!formData.notes && (
									<div className="text-center py-8 text-neutral-500">
										<p>No additional notes added yet. Click "Edit" to get started!</p>
									</div>
								)}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Last Updated Info */}
			{about && (
				<div className="mt-4 text-center text-sm text-neutral-500">
					Last updated: {formatDate(about.updated)}
				</div>
			)}
		</div>
	);
};

export default AboutSection;
