import React from "react";

const PlansPage: React.FC = () => {
	return (
		<div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
			<div className="pl-0 md:pl-56 flex justify-center items-center w-full">
				<div className="flex flex-col items-center justify-start pt-16 min-h-screen w-full">
					<div className="w-full max-w-4xl mx-auto p-6">
						<div className="text-center">
							<h1 className="text-4xl font-bold text-gray-800 mb-4">
								Plans
							</h1>
							<p className="text-gray-600 text-lg mb-8">
								Create and manage your plans
							</p>
							<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-12">
								<div className="text-6xl mb-4"><i className="fas fa-clipboard-list"></i></div>
								<h2 className="text-2xl font-bold text-gray-800 mb-4">
									Coming Soon
								</h2>
								<p className="text-gray-600">
									Planning functionality will be available soon!
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PlansPage;
