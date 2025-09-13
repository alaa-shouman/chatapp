import colors from "tailwindcss/colors";

export const appColors = {
  primary: "#0690F5",
  text: "#111827",
  border: "#D1D5DB",
  accent: "#10B981",
  error: colors.red[500],
  warning: colors.amber[500],
  success: colors.green[500],
} as const;

export type ColorShade = "light" | "DEFAULT" | "dark";
export type ColorName = keyof typeof appColors;
export type AppColors = typeof appColors;

export const getColor = (name: ColorName, shade: ColorShade = "DEFAULT") => {
  const color = appColors[name];
  return typeof color === "string" ? color : color[shade];
};

export default appColors;
