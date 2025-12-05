import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
type Color = "blue" | "green" | "orange" | "purple" | "red";

const ThemeContext = createContext<{
  theme: Theme;
  color: Color;
  toggleTheme: () => void;
  setColor: (c: Color) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [color, setColorState] = useState<Color>("blue");

  // Load from local storage on boot
  useEffect(() => {
    const savedTheme = localStorage.getItem("ui-theme") as Theme || "light";
    const savedColor = localStorage.getItem("ui-color") as Color || "blue";
    setTheme(savedTheme);
    setColorState(savedColor);
    applyTheme(savedTheme, savedColor);
  }, []);

  const applyTheme = (t: Theme, c: Color) => {
    const root = window.document.documentElement;
    
    // 1. Handle Dark Mode
    root.classList.remove("light", "dark");
    root.classList.add(t);

    // 2. Handle Colors (CSS Variables)
    // We update the --primary and --ring variables dynamically
    const colors: Record<Color, string> = {
      blue: "221.2 83.2% 53.3%",
      green: "142.1 76.2% 36.3%",
      orange: "24.6 95% 53.1%",
      purple: "262.1 83.3% 57.8%",
      red: "346.8 77.2% 49.8%"
    };
    
    root.style.setProperty("--primary", colors[c]);
    root.style.setProperty("--ring", colors[c]);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("ui-theme", newTheme);
    applyTheme(newTheme, color);
  };

  const setColor = (c: Color) => {
    setColorState(c);
    localStorage.setItem("ui-color", c);
    applyTheme(theme, c);
  };

  return (
    <ThemeContext.Provider value={{ theme, color, toggleTheme, setColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};