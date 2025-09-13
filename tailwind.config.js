/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx","./app/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx}",],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0690F5",
        text: "#111827",
        border: "#D1D5DB",
        accent: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        success: "#10B981",
      },
    },
  },
  plugins: [],
}