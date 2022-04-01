import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { ThemeProvider as StyledProvider } from "styled-components";

import { THEMES, THEME_VARIABLES } from "../constants/THEMES";

const GLOBAL_THEME_VARIABLE = "GLOBAL_THEME";

export const CustomThemeContext = createContext({ 
  theme: THEMES.DARK,
  themeVariables: THEME_VARIABLES.DARK,
  setTheme: (theme: string) => {}
});
export const useCustomTheme = () => useContext(CustomThemeContext);

const StyledThemeConsumer = (props: { children: ReactNode }) => {
  const { theme } = useContext(CustomThemeContext);
  return (
    <StyledProvider theme={THEME_VARIABLES[theme]}>{props.children}</StyledProvider>
  );
};

export const ThemeProvider = (props: { children: ReactNode }) => {
  const [theme, setCurrentTheme] = useState(THEMES.DARK);
  const [themeVariables, setCurrentThemeVariables] = useState(THEME_VARIABLES.DARK);

  useEffect(() => {
    const cachedTheme = localStorage.getItem(GLOBAL_THEME_VARIABLE);
    if (cachedTheme) {
      if (Object.values(THEMES).indexOf(cachedTheme) === -1) {
        console.warn("Invalid cached theme, hence removing it !!!!");
        localStorage.removeItem(GLOBAL_THEME_VARIABLE);
      } else {
        setCurrentTheme(cachedTheme);
        return;
      }
    }
    const darkOS = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const newTheme = darkOS ? THEMES.DARK : THEMES.LIGHT;
    localStorage.setItem(GLOBAL_THEME_VARIABLE, newTheme);
    setCurrentTheme(newTheme);
  }, []);

  useEffect(() => {
    // Set css variables based on theme
    const newThemeVariables = THEME_VARIABLES[theme];
    const keys = Object.keys(newThemeVariables);
    keys.map((key) => {
      const constructVar = `--${key}`;
      document.body.style.setProperty(
        constructVar,
        THEME_VARIABLES[theme][key]
      );
      return false; /// cuz eslint just wants me to return something
    });
    setCurrentThemeVariables(newThemeVariables);
  }, [theme]);

  const setTheme = (newTheme: string) => {
    if (Object.values(THEMES).indexOf(newTheme) === -1) {
      return console.warn("Invalid theme opted !!!!");
    }
    localStorage.setItem(GLOBAL_THEME_VARIABLE, newTheme);
    setCurrentTheme(newTheme);
  };

  return (
    <CustomThemeContext.Provider value={{ theme, themeVariables, setTheme }}>
      <StyledThemeConsumer>{props.children}</StyledThemeConsumer>
    </CustomThemeContext.Provider>
  );
};