import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark"; // Lock type to just 'dark'
type Color = "blue" | "green" | "orange" | "purple" | "red";

const ThemeContext = createContext<{
  theme: Theme;
  color: Color;
  setColor: (c: Color) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme: Theme = "dark"; // Hardcode theme
  const [color, setColorState] = useState<Color>("blue");

  useEffect(() => {
    const savedColor = (localStorage.getItem("ui-color") as Color) || "blue";
    setColorState(savedColor);
    applyTheme(savedColor);
  }, []);

  const applyTheme = (c: Color) => {
    const root = window.document.documentElement;
    root.classList.add("dark"); // Force dark class
    root.classList.remove("light");

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

  const setColor = (c: Color) => {
    setColorState(c);
    localStorage.setItem("ui-color", c);
    applyTheme(c);
  };

  return (
    <ThemeContext.Provider value={{ theme, color, setColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};