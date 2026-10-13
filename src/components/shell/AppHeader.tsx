"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Layers, PlusCircle } from "lucide-react";
import { DemoBadge } from "./DemoBadge";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NAVIGATION_ITEMS } from "./AppSidebar";
import { cn } from "@/lib/utils/cn";

export const AppHeader: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 px-4 sm:px-6 backdrop-blur-md transition-colors duration-150">
      {/* Mobile brand & toggle */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <Layers className="h-4 w-4" />
          </div>
          <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
            LostLens
          </span>
        </Link>
      </div>

      {/* Quick Search Shortcut or Title */}
      <div className="hidden md:flex items-center gap-3">
        <Link
          href="/explore"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors w-64 shadow-2xs"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <span>Search lost & found reports...</span>
          <kbd className="ml-auto text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-400 dark:text-slate-500 font-mono">
            /
          </kbd>
        </Link>
      </div>

      {/* Right Action Icons: Demo Badge, Theme Toggle, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        <DemoBadge />
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
        <ThemeToggle />
        <NotificationDropdown />
        <UserMenu />
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shadow-xl md:hidden z-40 animate-fade-in">
          <div className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/report"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-500/20"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Submit Report</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
