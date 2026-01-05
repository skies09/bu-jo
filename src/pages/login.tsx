import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import { useLoginActions } from "../hooks/login.actions";

const Login = () => {
	const { login, register, forgotPassword } = useLoginActions();
	const [isLoginForm, setIsLoginForm] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const handleSubmit = async (values: any) => {
		setIsSubmitting(true);
		setErrorMessage("");

		try {
			if (showForgotPasswordForm) {
				await forgotPassword({ email: values.email });
			} else if (isLoginForm) {
				await login({
					email: values.email,
					password: values.password,
				});
			} else {
				await register({
					username: values.username,
					email: values.email,
					password: values.password,
					confirmPassword: values.confirmPassword,
				});
			}
		} catch (err: any) {
			let errorMsg = "Something went wrong. Please try again.";

			if (err?.response) {
				// Server responded with error
				const detail =
					err.response.data?.detail || err.response.data?.message;
				if (detail) {
					errorMsg = Array.isArray(detail)
						? detail.join(", ")
						: detail;
				} else if (err.response.status === 400) {
					errorMsg =
						"Invalid credentials. Please check your email and password.";
				} else if (err.response.status === 401) {
					errorMsg = "Invalid email or password. Please try again.";
				} else if (err.response.status === 403) {
					errorMsg =
						"Access denied. Please contact support if this persists.";
				} else if (err.response.status === 404) {
					errorMsg = "Service not found. Please try again later.";
				} else if (err.response.status >= 500) {
					errorMsg =
						"Server error. Please try again in a few moments.";
				}
			} else if (err?.message) {
				// Network or other error
				if (
					err.message.includes("Network Error") ||
					err.message.includes("network")
				) {
					errorMsg = "Unable to connect to the server.";
				} else if (err.message.includes("timeout")) {
					errorMsg = "Request timed out. Please try again.";
				} else {
					errorMsg = err.message;
				}
			}

			setErrorMessage(errorMsg);
		}

		setIsSubmitting(false);
	};

	return (
		<div
			className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative login-page-container"
			style={{
				backgroundImage: "url('/images/lake1.jpg')",
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundRepeat: "no-repeat",
			}}
		>
			{/* Overlay for better readability */}
			<div className="absolute inset-0 bg-gradient-to-br from-colorFive/60 via-colorThree/50 to-colorOne/60 backdrop-blur-[2px]"></div>

			{/* Content */}
			<div className="relative z-10 w-full max-w-md">
				<h1 className="font-greatVibes text-6xl font-bold !text-black tracking-wider drop-shadow-lg text-center mb-6 lg:mb-10">
					BuJo
				</h1>

				<div className="w-full rounded-3xl p-8 !text-black relative bg-white/15 backdrop-blur-md shadow-2xl border border-white/20">
					{/* Tab Navigation */}
					<div
						className="flex justify-center mb-6"
						role="tablist"
						aria-label="Login or Sign up"
					>
						<button
							type="button"
							role="tab"
							aria-selected={
								isLoginForm && !showForgotPasswordForm
							}
							aria-controls="login-panel"
							id="login-tab"
							onClick={() => {
								setIsLoginForm(true);
								setShowForgotPasswordForm(false);
								setErrorMessage("");
							}}
							className={`px-8 py-3 rounded-l-xl transition-all duration-300 font-poppins text-sm font-medium ${
								isLoginForm && !showForgotPasswordForm
									? "bg-white/25 !text-black font-semibold shadow-[0_10px_40px_rgba(0,0,0,0.3),0_0_20px_rgba(255,255,255,0.5)]"
									: "bg-white/10 !text-gray-900 hover:bg-white/20 hover:!text-black"
							} focus:outline-none`}
						>
							Login
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={
								!isLoginForm && !showForgotPasswordForm
							}
							aria-controls="signup-panel"
							id="signup-tab"
							onClick={() => {
								setIsLoginForm(false);
								setShowForgotPasswordForm(false);
								setErrorMessage("");
							}}
							className={`px-8 py-3 rounded-r-xl transition-all duration-300 font-poppins text-sm font-medium ${
								!isLoginForm && !showForgotPasswordForm
									? "bg-white/25 !text-black font-semibold shadow-[0_10px_40px_rgba(0,0,0,0.3),0_0_20px_rgba(255,255,255,0.5)]"
									: "bg-white/10 !text-gray-900 hover:bg-white/20 hover:!text-black"
							} focus:outline-none`}
						>
							Sign Up
						</button>
					</div>

					<h2 className="text-3xl font-semibold text-center mb-8 font-poppins !text-black drop-shadow-md">
						{showForgotPasswordForm
							? "Reset Your Password"
							: isLoginForm
							? "Welcome Back"
							: "Create Account"}
					</h2>

					<Formik
						initialValues={{
							username: "",
							email: "",
							password: "",
							confirmPassword: "",
						}}
						onSubmit={handleSubmit}
					>
						{() => (
							<Form
								className="space-y-6"
								aria-label={
									showForgotPasswordForm
										? "Password reset form"
										: isLoginForm
										? "Login form"
										: "Sign up form"
								}
							>
								{showForgotPasswordForm ? (
									<div
										role="tabpanel"
										id="forgot-password-panel"
										aria-labelledby="forgot-password-tab"
									>
										<div className="space-y-6">
											<div>
												<label
													htmlFor="reset-email"
													className="sr-only"
												>
													Email address
												</label>
												<Field
													id="reset-email"
													name="email"
													type="email"
													placeholder="Enter your email"
													required
													aria-required="true"
													aria-label="Email address for password reset"
													className="w-full px-5 py-3.5 rounded-xl bg-white/20 backdrop-blur-sm placeholder-gray-700 !text-black border border-white/30 focus:ring-2 focus:ring-gray-800 focus:border-gray-700 focus:outline-none focus:bg-white/30 transition-all duration-200"
												/>
											</div>
											<button
												type="submit"
												disabled={isSubmitting}
												aria-busy={isSubmitting}
												className="w-full py-3.5 rounded-xl bg-white/25 hover:bg-white/35 font-semibold transition-all duration-300 font-poppins border border-white/40 hover:border-white/60 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed !text-black"
											>
												{isSubmitting
													? "Sending..."
													: "Send Reset Link"}
											</button>
										</div>
									</div>
								) : (
									<div
										role="tabpanel"
										id={
											isLoginForm
												? "login-panel"
												: "signup-panel"
										}
										aria-labelledby={
											isLoginForm
												? "login-tab"
												: "signup-tab"
										}
									>
										<div className="space-y-5">
											<div>
												<label
													htmlFor="email"
													className="sr-only"
												>
													Email address
												</label>
												<Field
													id="email"
													name="email"
													type="email"
													placeholder="Email"
													required
													aria-required="true"
													aria-label="Email address"
													autoComplete="email"
													className="w-full px-5 py-3.5 rounded-xl bg-white/20 backdrop-blur-sm placeholder-gray-700 !text-black border border-white/30 focus:ring-2 focus:ring-gray-800 focus:border-gray-700 focus:outline-none focus:bg-white/30 transition-all duration-200"
												/>
											</div>

											{!isLoginForm && (
												<div>
													<label
														htmlFor="username"
														className="sr-only"
													>
														Username
													</label>
													<Field
														id="username"
														name="username"
														type="text"
														placeholder="Username"
														required
														aria-required="true"
														aria-label="Username"
														autoComplete="username"
														className="w-full px-5 py-3.5 rounded-xl bg-white/20 backdrop-blur-sm placeholder-gray-700 !text-black border border-white/30 focus:ring-2 focus:ring-gray-800 focus:border-gray-700 focus:outline-none focus:bg-white/30 transition-all duration-200"
													/>
												</div>
											)}

											<div className="relative">
												<label
													htmlFor="password"
													className="sr-only"
												>
													Password
												</label>
												<Field
													id="password"
													name="password"
													type={
														showPassword
															? "text"
															: "password"
													}
													placeholder="Password"
													required
													aria-required="true"
													aria-label="Password"
													autoComplete={
														isLoginForm
															? "current-password"
															: "new-password"
													}
													className="w-full px-5 py-3.5 pr-12 rounded-xl bg-white/20 backdrop-blur-sm placeholder-gray-700 !text-black border border-white/30 focus:ring-2 focus:ring-gray-800 focus:border-gray-700 focus:outline-none focus:bg-white/30 transition-all duration-200"
												/>
												<button
													type="button"
													onClick={() =>
														setShowPassword(
															!showPassword
														)
													}
													aria-label={
														showPassword
															? "Hide password"
															: "Show password"
													}
													aria-pressed={showPassword}
													className="absolute right-4 top-1/2 -translate-y-1/2 !text-gray-900 hover:!text-black focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded p-1 transition-colors"
												>
													{showPassword ? "🙈" : "👁️"}
												</button>
											</div>

											{!isLoginForm && (
												<div>
													<label
														htmlFor="confirmPassword"
														className="sr-only"
													>
														Confirm Password
													</label>
													<Field
														id="confirmPassword"
														name="confirmPassword"
														type="password"
														placeholder="Confirm Password"
														required
														aria-required="true"
														aria-label="Confirm password"
														autoComplete="new-password"
														className="w-full px-5 py-3.5 rounded-xl bg-white/20 backdrop-blur-sm placeholder-gray-700 !text-black border border-white/30 focus:ring-2 focus:ring-gray-800 focus:border-gray-700 focus:outline-none focus:bg-white/30 transition-all duration-200"
													/>
												</div>
											)}

											{isLoginForm && (
												<div className="flex justify-between items-center text-sm">
													<label className="flex items-center cursor-pointer group">
														<input
															type="checkbox"
															name="remember"
															className="mr-2 w-4 h-4 rounded border-white/30 bg-white/20 text-colorFive focus:ring-2 focus:ring-gray-800 focus:ring-offset-0 cursor-pointer"
															aria-label="Remember me"
														/>
														<span className="!text-black group-hover:!text-gray-900 transition-colors">
															Remember me
														</span>
													</label>
													<button
														type="button"
														onClick={() => {
															setShowForgotPasswordForm(
																true
															);
															setErrorMessage("");
														}}
														className="!text-black hover:!text-gray-900 underline focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded px-1 transition-colors"
														aria-label="Forgot password? Reset your password"
													>
														Forgot password?
													</button>
												</div>
											)}

											<button
												type="submit"
												disabled={isSubmitting}
												aria-busy={isSubmitting}
												className="w-full py-3.5 rounded-xl bg-white/25 hover:bg-white/35 font-semibold transition-all duration-300 font-poppins border border-white/40 hover:border-white/60 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed !text-black"
											>
												{isSubmitting
													? "Loading..."
													: isLoginForm
													? "Sign In"
													: "Create Account"}
											</button>
										</div>
									</div>
								)}

								{errorMessage && (
									<div
										role="alert"
										aria-live="polite"
										className="text-red-800 text-center text-sm bg-red-100/90 backdrop-blur-sm p-4 rounded-xl shadow-md"
									>
										<strong className="font-semibold">
											Error:{" "}
										</strong>
										{errorMessage}
									</div>
								)}
							</Form>
						)}
					</Formik>

					{!showForgotPasswordForm && (
						<div className="mt-8 pt-6 border-t border-white/20 text-center text-sm">
							<p className="!text-black">
								{isLoginForm
									? "Don't have an account?"
									: "Already have an account?"}{" "}
								<button
									type="button"
									onClick={() => {
										setIsLoginForm(!isLoginForm);
										setErrorMessage("");
									}}
									className="!text-black font-semibold underline hover:!text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded px-1 transition-colors"
									aria-label={
										isLoginForm
											? "Switch to sign up form"
											: "Switch to login form"
									}
								>
									{isLoginForm ? "Sign up" : "Sign in"}
								</button>
							</p>
						</div>
					)}

					{showForgotPasswordForm && (
						<div className="mt-6 text-center text-sm">
							<button
								type="button"
								onClick={() => {
									setShowForgotPasswordForm(false);
									setErrorMessage("");
								}}
								className="!text-black hover:!text-gray-800 underline font-poppins focus:outline-none focus:ring-2 focus:ring-gray-800 focus:rounded px-1 transition-colors"
								aria-label="Return to sign in form"
							>
								← Back to Sign In
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Login;
