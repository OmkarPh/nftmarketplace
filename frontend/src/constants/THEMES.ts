export const THEMES = {
  LIGHT: "LIGHT",
  DARK: "DARK",
};

export const THEME_VARIABLES: any = {
  [THEMES.LIGHT]: {
    textColor: "#292929",
    textFocused: "#1a1818",
    background: "#ffffff",
    backgroundWide: "#ffffff",
    backgroundGradientStart: "#ffffff",
    backgroundGradientEnd: "#fffaf4",
    togglerColor: "#000",
    primaryFocusBlue: "#1c74d3",
    isDark: false,
  },
  [THEMES.DARK]: {
    textColor: "#ffffff",
    textFocused: "rgb(202, 202, 202)",
    background: "#141313",
    backgroundWide: "#202225",
    backgroundGradientStart: "#202225",
    backgroundGradientEnd: "#151530",
    togglerColor: "#434343",
    primaryFocusBlue: "#1c74d3",
    isDark: true,
  },
};