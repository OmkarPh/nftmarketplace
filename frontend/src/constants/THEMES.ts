export const THEMES = {
  LIGHT: "LIGHT",
  DARK: "DARK",
};

export const THEME_VARIABLES: any = {
  [THEMES.LIGHT]: {
    textColor: "#292929",
    textFocused: "#1a1818",
    background: "#ffffff",
    togglerColor: "#000",
    isDark: false,
  },
  [THEMES.DARK]: {
    textColor: "#ffffff",
    textFocused: "rgb(202, 202, 202)",
    background: "#141313",
    togglerColor: "#434343",
    isDark: true,
  },
};