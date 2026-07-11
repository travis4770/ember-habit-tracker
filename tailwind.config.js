/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF7F2",
        paperDim: "#F1ECE3",
        ink: "#2B2A33",
        inkSoft: "#6B6875",
        forest: "#3D6B4F",
        forestDeep: "#2A4D38",
        amber: "#E08A3C",
        amberSoft: "#F2C79A",
        quartz: "#B9776C",
        quartzSoft: "#EAD4CF",
        line: "#E4DDD0",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
