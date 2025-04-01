/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],

	theme: {
		colors: {
			colorTwo: "#6A8DAB",
			colorFive: "#F6CBD1",
			colorFive: "#7B668E",
			colorFive: "#A593B3",
			colorFive: "#5C4A6E",
		},
		fontFamily: {
			fugaz: ["Fugaz One", "sans-serif"],
			racing: ["Racing Sans One", "sans-serif"],
			zilla: ["Zilla Slab", "serif"],
			russo: ["Russo One", "sans-serif"],
			bebas: ["Bebas Neue", "sans-serif"],
			oswald: ["Oswald", "sans-serif"],
			monoTwo: ["Roboto Mono", "monospace"],
		},
		extend: {
			transitionDuration: {
				2000: "2000ms",
			},
			boxShadow: {
				"shadow-colorTwo":
					"0 0 5px #00A8E8, 0 0 10px #00A8E8, 0 0 20px #00A8E8, 0 0 40px #00A8E8",
				"shadow-colorFive":
					"0 0 5px #003459, 0 0 10px #003459, 0 0 20px #003459, 0 0 40px #003459",
			},
		},
	},
	plugins: [],
};
