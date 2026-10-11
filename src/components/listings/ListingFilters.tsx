"use client";

import React from "react";
import { Search, RotateCcw, Filter } from "lucide-react";
import { ItemCategory } from "@/lib/types/listing";

export interface FilterState {
  search: string;
  type: "all" | "lost" | "found";
  category: string;
  color: string;
  zone: string;
  status: string;
  sortBy: "newest" | "oldest";
}

export interface ListingFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categories: ItemCategory[];
  zones: string[];
}

const COMMON_COLORS = [
  "All",
  "Black",
  "Blue",
  "White",
  "Gray",
  "Red",
  "Green",
  "Brown",
  "Silver",
  "Yellow",
];

export const ListingFilters: React.FC<ListingFiltersProps> = ({
  filters,
  onChange,
  categories,
  zones,
}) => {
  const handleTypeChange = (type: "all" | "lost" | "found") => {
    onChange({ ...filters, type });
  };

  const handleReset = () => {
    onChange({
      search: "",
      type: "all",
      category: "All",
      color: "All",
      zone: "All",
      status: "All",
      sortBy: "newest",
    });
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-4">
      {/* Top row: Search input & Type segmented button */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by keyword, item name, brand, or details..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9.5 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Type selector */}
        <div className="flex items-center rounded-lg bg-slate-100 p-1 self-start sm:self-auto shrink-0">
          {(["all", "lost", "found"] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                filters.type === t
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t === "all" ? "All Items" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row: Select dropdowns & Reset button */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
        {/* Category */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="w-full h-8.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Color
          </label>
          <select
            value={filters.color}
            onChange={(e) => onChange({ ...filters, color: e.target.value })}
            className="w-full h-8.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {COMMON_COLORS.map((col) => (
              <option key={col} value={col}>
                {col === "All" ? "All Colors" : col}
              </option>
            ))}
          </select>
        </div>

        {/* Campus Zone */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Campus Zone
          </label>
          <select
            value={filters.zone}
            onChange={(e) => onChange({ ...filters, zone: e.target.value })}
            className="w-full h-8.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Zones</option>
            {zones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="w-full h-8.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="in_claim">In Claim Review</option>
            <option value="resolved">Recovered</option>
          </select>
        </div>

        {/* Sort & Reset */}
        <div className="flex items-end gap-1.5 col-span-2 sm:col-span-1">
          <div className="flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Sort
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onChange({ ...filters, sortBy: e.target.value as "newest" | "oldest" })
              }
              className="w-full h-8.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          <button
            onClick={handleReset}
            className="h-8.5 px-2.5 rounded-md border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center shrink-0"
            title="Reset all filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
