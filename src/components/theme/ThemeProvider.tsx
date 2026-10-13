"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "lostlens-theme";

export const ThemeScript: React.FC = () => {
  const scriptContent = `
    (function() {
      try {
        var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
        var theme = stored || "system";
        var isDark = false;
        if (theme === "dark") {
          isDark = true;
        } else if (theme === "light") {
          isDark = false;
        } else {
          isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        if (isDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (e) {}
    })();
  `;

  return (
    <script
      id="theme-initializer"
      dangerouslySetInnerHTML={{ __html: scriptContent }}
    />
  );
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored && (stored === "light" || stored === "dark" || stored === "system")) {
        setThemeState(stored);
      }
    } catch {
      // pass
    }
    setMounted(true);
  }, []);

  // Update DOM and resolved theme when theme or system preferences change
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const computeResolvedTheme = (): ResolvedTheme => {
      if (theme === "dark") return "dark";
      if (theme === "light") return "light";
      return mediaQuery.matches ? "dark" : "light";
    };

    const updateTheme = () => {
      const resolved = computeResolvedTheme();
      setResolvedTheme(resolved);
      if (resolved === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    updateTheme();

    const handleChange = () => {
      if (theme === "system") {
        updateTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // pass
    }
  };

  const toggleTheme = () => {
    const nextTheme: Theme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: mounted ? resolvedTheme : "light",
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
