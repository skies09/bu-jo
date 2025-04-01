import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import emailjs from "@emailjs/browser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useLoginActions } from "../hooks/login.actions";

// import { motion } from "framer-motion";

const Login = () => {
	const [loggingIn, setIsLoggingIn] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [isLoginForm, setIsLoginForm] = useState(true);
	const [formSubmitted, setFormSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const loginActions = useLoginActions();

	const login = (values: any) => {
		const data = {
			username: values.username,
			password: values.password,
		};
		console.log(data, "data");
		loginActions.login(data).catch((err: any) => {
			if (err.message) {
				setErrorMessage(err.request.response);
			}
		});
	};

	return (
		<div id="account" className="w-screen overflow-hidden h-auto mt-20">
			<div className="text-white py-4 flex justify-center">
				<button
					onClick={() => setIsLoginForm(true)}
					className={`px-6 py-2 mx-2 ${
						isLoginForm
							? "bg-colorTwo text-colorFive"
							: "bg-colorFive text-colorTwo "
					} rounded-lg transition-all shadow-md font-poppins font-semibold`}
				>
					Login
				</button>
				<button
					onClick={() => setIsLoginForm(false)}
					className={`px-6 py-2 mx-2 ${
						!isLoginForm
							? "bg-colorTwo text-colorFive"
							: "bg-colorFive text-colorTwo"
					} rounded-lg transition-all shadow-md font-poppins font-semibold`}
				>
					Signup
				</button>
			</div>
			<div className="flex flex-col md:flex-row my-4 h-full min-h-auto">
				{/* Left side (Login) */}
				<div className="flex items-stretch justify-center flex-1 bg-gray-100">
					{isLoginForm && (
						<div className="w-5/6 lg:w-1/2 p-6 bg-colorOne rounded-xl shadow-lg mx-10 my-4 flex flex-col justify-between">
							<div>
								<p className="text-colorTwo text-2xl font-bold mb-4 font-poppins text-center">
									Login
								</p>
								<Formik
									initialValues={{
										username: "",
										password: "",
									}}
									validationSchema={Yup.object({
										username: Yup.string().required(
											"Username is required"
										),
										password: Yup.string().required(
											"Password is required"
										),
									})}
									onSubmit={(values, { setSubmitting }) => {
										setErrorMessage("");
										setIsLoggingIn(true);

										login(values);
										setSubmitting(false);
									}}
								>
									{({ values, isSubmitting }) => (
										<Form className="my-4 flex flex-col justify-start items-start w-full lg:w-full">
											<p className="block text-md text-colorTwo font-sans">
												Username
											</p>
											<Field
												className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 font-sans"
												type="text"
												id="username"
												name="username"
												placeholder="Username"
											/>
											<div className="relative w-full">
												<p className="block text-md text-colorTwo font-sans">
													Password
												</p>

												<Field
													className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 font-sans pr-10"
													type={
														showPassword
															? "text"
															: "password"
													}
													id="password"
													name="password"
													placeholder="Password"
												/>

												<span
													onClick={() =>
														setShowPassword(
															!showPassword
														)
													}
													className="absolute right-3 top-8 cursor-pointer text-gray-500 hover:text-colorTwo"
												>
													<FontAwesomeIcon
														icon={
															!showPassword
																? faEyeSlash
																: faEye
														}
													/>
												</span>
											</div>

											<div className="flex items-center justify-center mt-4 w-full">
												<button
													disabled={
														!values.password ||
														!values.username
													}
													type="submit"
													className={`px-10 py-2 rounded-lg transition-all shadow-md font-poppins font-semibold bg-colorTwo text-colorFour ${
														!values.password ||
														!values.username
															? "opacity-60 cursor-not-allowed"
															: "hover:bg-colorOne hover:text-colorTwo"
													}`}
												>
													{loggingIn
														? "Logging in ..."
														: "Login"}
												</button>
											</div>
										</Form>
									)}
								</Formik>
							</div>
							{errorMessage && (
								<div className="flex flex-col justify-center items-center mx-auto">
									<div className="flex text-center mt-2 w-full justify-center items-center">
										<p className="text-sm lg:text-lg text-center font-poppins font-medium text-[#FF0000]">
											{errorMessage}
										</p>
									</div>
									<p className="mt-2 text-sm lg:text-lg text-center font-poppins font-medium">
										Trouble logging in?
										<br />
										Contact us
									</p>
									<Link
										to="/Contact"
										className="px-10 py-2 w-full mx-auto bg-colorTwo text-colorFive rounded-lg transition-all shadow-md font-poppins font-semibold hover:bg-colorOne hover:text-colorTwo"
									>
										Contact us
									</Link>
								</div>
							)}
						</div>
					)}

					{/* Right side (Signup) */}
					{!isLoginForm && (
						<div className="flex flex-col items-stretch justify-center flex-1 bg-gray-100">
							{!formSubmitted && (
								<div className="flex justify-center mx-auto text-center">
									Sign up here{" "}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Login;
