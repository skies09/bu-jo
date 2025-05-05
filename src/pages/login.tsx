import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import { loginActions } from "../store/login/actions";

const Login = () => {
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
				await loginActions.forgotPassword({ email: values.email });
			} else if (isLoginForm) {
				await loginActions.login({
					username: values.username,
					password: values.password,
				});
			} else {
				await loginActions.register({
					username: values.username,
					email: values.email,
					password: values.password,
					confirmPassword: values.confirmPassword,
				});
			}
		} catch (err: any) {
			if (err.message) {
				setErrorMessage(
					err.request?.response || "Something went wrong"
				);
			}
		}

		setIsSubmitting(false);
	};

	return (
		<div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-colorOne via-colorSix to-colorTwo">
			<div className="w-full max-w-md rounded-2xl p-8 text-white relative border border-colorFive bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] ring-1 ring-white/10">
				<div className="flex justify-center mb-6">
					<button
						onClick={() => {
							setIsLoginForm(true);
							setShowForgotPasswordForm(false);
						}}
						className={`px-6 py-2 rounded-l-lg transition-all duration-300 ${
							isLoginForm && !showForgotPasswordForm
								? "underline font-semibold"
								: "hover:bg-white/10"
						}`}
					>
						Login
					</button>
					<button
						onClick={() => {
							setIsLoginForm(false);
							setShowForgotPasswordForm(false);
						}}
						className={`px-6 py-2 rounded-r-lg transition-all duration-300 ${
							!isLoginForm && !showForgotPasswordForm
								? "underline font-semibold"
								: "hover:bg-white/10"
						}`}
					>
						Signup
					</button>
				</div>

				<h2 className="text-2xl font-bold text-center mb-6">
					{showForgotPasswordForm
						? "Reset Your Password"
						: isLoginForm
						? "Sign In"
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
						<Form className="space-y-5">
							{showForgotPasswordForm ? (
								<>
									<Field
										name="email"
										type="email"
										placeholder="Enter your email"
										className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-white/70 focus:ring-2 focus:ring-white focus:outline-none"
									/>
									<button
										type="submit"
										className="w-full py-3 rounded-lg bg-white/30 hover:bg-white/40 font-semibold transition-all duration-300"
									>
										Send Reset Link
									</button>
								</>
							) : (
								<>
									{!isLoginForm && (
										<Field
											name="email"
											type="email"
											placeholder="Email"
											className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-white/70 focus:ring-2 focus:ring-white focus:outline-none"
										/>
									)}

									<Field
										name="username"
										type="text"
										placeholder="Username"
										className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-white/70 focus:ring-2 focus:ring-white focus:outline-none"
									/>

									<div className="relative">
										<Field
											name="password"
											type={
												showPassword
													? "text"
													: "password"
											}
											placeholder="Password"
											className="w-full px-4 py-3 pr-10 rounded-lg bg-white/20 placeholder-white/70 focus:ring-2 focus:ring-white focus:outline-none"
										/>
										<button
											type="button"
											className="absolute right-3 top-3 text-white/80"
											onClick={() =>
												setShowPassword(!showPassword)
											}
										>
											{showPassword ? "🙈" : "👁️"}
										</button>
									</div>

									{!isLoginForm && (
										<Field
											name="confirmPassword"
											type="password"
											placeholder="Confirm Password"
											className="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-white/70 focus:ring-2 focus:ring-white focus:outline-none"
										/>
									)}

									{isLoginForm && (
										<div className="flex justify-between text-sm">
											<label className="flex items-center">
												<input
													type="checkbox"
													className="mr-2"
												/>
												Remember me
											</label>
											<button
												type="button"
												onClick={() =>
													setShowForgotPasswordForm(
														true
													)
												}
												className="text-white/80 hover:underline"
											>
												Forgot password?
											</button>
										</div>
									)}

									<button
										type="submit"
										disabled={isSubmitting}
										className="w-full py-3 rounded-lg bg-white/30 hover:bg-white/40 font-semibold transition-all duration-300"
									>
										{isSubmitting
											? "Loading..."
											: isLoginForm
											? "Sign In"
											: "Create Account"}
									</button>
								</>
							)}

							{errorMessage && (
								<p className="text-red-300 text-center text-sm bg-red-500/10 p-2 rounded-lg">
									{errorMessage}
								</p>
							)}
						</Form>
					)}
				</Formik>

				{!showForgotPasswordForm && (
					<div className="mt-6 pt-4 border-t border-white/10 text-center text-sm">
						<p>
							{isLoginForm
								? "Don't have an account?"
								: "Already have an account?"}{" "}
							<button
								onClick={() => setIsLoginForm(!isLoginForm)}
								className="underline"
							>
								{isLoginForm ? "Sign up" : "Sign in"}
							</button>
						</p>
					</div>
				)}

				{showForgotPasswordForm && (
					<div className="mt-6 text-center text-sm">
						<button
							onClick={() => setShowForgotPasswordForm(false)}
							className="underline"
						>
							Back to Sign In
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Login;
