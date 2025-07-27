/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		colors: {
			colorOne: "#6A8DAB",
			colorTwo: "#F6CBD1",
			colorThree: "#7B668E",
			colorFour: "#A593B3",
			colorFive: "#5C4A6E",
			colorSix: "#CADFFD",
			colorSeven: "#C3BEEF",
			colorEight: "#CCA9E8",
			colorNine: "#CDB4D8",
			colorTen: "#FFC8DD",
			colorEleven: "#FFAFCC",
			colorTwelve: "#BDE0FE",
			colorThirteen: "#A2D2FF",
			// Theme-specific colors
			auto: {
				bg: "#8E9AAF",
				text: "#CBC0D3",
				primary: "#DEE2FF",
				accent: "#EFD3D7",
			},
			cosy: {
				bg: "#BDB2FF",
				text: "#FFADAD",
				primary: "#9BF6FF",
				accent: "#FDFFB6",
			},
			elite: {
				bg: "#3C1642",
				text: "#086375",
				primary: "#1DD3B0",
				accent: "#B2FF9E",
			},
		},
		fontFamily: {
			sans: ["Open Sans", "sans-serif"],
			serif: ["Playfair Display", "serif"],
			mono: ["Montserrat", "sans-serif"],
			satisfy: ["Satisfy", "cursive"],
			greatVibes: ["Great Vibes", "cursive"],
			poppins: ["Poppins", "sans-serif"],
		},
		extend: {
			transitionDuration: {
				2000: "2000ms",
			},
			boxShadow: {
				"shadow-colorOne":
					"0 0 5px #00A8E8, 0 0 10px #00A8E8, 0 0 20px #00A8E8, 0 0 40px #00A8E8",
				"shadow-colorTwo":
					"0 0 5px #003459, 0 0 10px #003459, 0 0 20px #003459, 0 0 40px #003459",
			},
		},
	},
	plugins: [],
};
