"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils/cn";

export interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  showLabel = false,
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={cn(
          "p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none",
          className
        )}
      >
        <div className="h-4 w-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative">
      <button
        onClick={toggleTheme}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu((prev) => !prev);
        }}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode (right-click for system)" : "Switch to dark mode (right-click for system)"}
        className={cn(
          "relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          className
        )}
      >
        {isDark ? (
          <Sun className="h-4.5 w-4.5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="h-4.5 w-4.5 text-slate-600 hover:text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
        )}
        {showLabel && (
          <span className="ml-2 text-xs font-medium">
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        )}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-slate-900 p-1.5 shadow-xl border border-slate-200 dark:border-slate-800 z-50 text-xs animate-fade-in">
            <button
              onClick={() => {
                setTheme("light");
                setShowMenu(false);
              }}
              className={cn(
                "flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-left transition-colors",
                theme === "light"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>Light</span>
            </button>
            <button
              onClick={() => {
                setTheme("dark");
                setShowMenu(false);
              }}
              className={cn(
                "flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-left transition-colors",
                theme === "dark"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Moon className="h-3.5 w-3.5" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => {
                setTheme("system");
                setShowMenu(false);
              }}
              className={cn(
                "flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-left transition-colors",
                theme === "system"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Laptop className="h-3.5 w-3.5" />
              <span>System</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
