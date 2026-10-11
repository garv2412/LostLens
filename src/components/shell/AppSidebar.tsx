"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Sparkles,
  PlusCircle,
  FolderHeart,
  BarChart3,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const NAVIGATION_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Explore Listings",
    href: "/explore",
    icon: Search,
  },
  {
    name: "Smart Matches",
    href: "/matches",
    icon: Sparkles,
    highlight: true,
  },
  {
    name: "Report Item",
    href: "/report",
    icon: PlusCircle,
  },
  {
    name: "My Reports",
    href: "/my-reports",
    icon: FolderHeart,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

export const AppSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 bg-white border-r border-slate-200/80 shadow-2xs">
      {/* Brand Header */}
      <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              LostLens
            </span>
            <span className="text-[10px] block font-semibold text-indigo-600 tracking-wider uppercase -mt-0.5">
              AI Campus Recovery
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {NAVIGATION_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-400 group-hover:text-slate-600",
                  item.highlight && !isActive && "text-indigo-500"
                )}
              />
              <span className="flex-1">{item.name}</span>
              {item.highlight && (
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-indigo-100" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Action in Footer */}
      <div className="p-4 border-t border-slate-100">
        <Link
          href="/report"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Post New Report</span>
        </Link>
      </div>
    </aside>
  );
};
