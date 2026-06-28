"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeCtx = createContext({ theme: "dark", toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

export default function ThemeProvider({ children }) {
  // Default dark (the primary design). Read localStorage after mount to avoid SSR mismatch.
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sheild-theme");
      if (saved && saved !== theme) {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch (_) {}
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("sheild-theme", next);
      document.documentElement.setAttribute("data-theme", next);
    } catch (_) {}
  };

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
  );
}
