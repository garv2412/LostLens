"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { ListingFilters, FilterState } from "@/components/listings/ListingFilters";
import { DemoStore } from "@/lib/demo/store";
import { Listing, ItemCategory } from "@/lib/types/listing";

const CATEGORIES: ItemCategory[] = [
  "Bags & Backpacks",
  "Water Bottles & Drinkware",
  "Earbuds & Headphones",
  "Electronics & Laptops",
  "Books & Notebooks",
  "Keys & Keychains",
  "Umbrellas & Rainwear",
  "Chargers & Cables",
  "Sports & Fitness",
  "Jewelry & Watches",
  "Wallets & Cards",
  "Eyewear & Glasses",
  "Clothing & Jackets",
  "Other",
];

const ZONES = [
  "Library Quad",
  "Science Complex",
  "Student Center",
  "Athletics",
  "North Campus",
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as "lost" | "found") || "all";

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: initialType,
    category: "All",
    color: "All",
    zone: "All",
    status: "All",
    sortBy: "newest",
  });

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch("/api/listings");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setAllListings(json.data);
          return;
        }
      } catch {
        // pass
      }

      try {
        const data = DemoStore.getListings();
        setAllListings(data);
      } catch {
        // pass
      } finally {
        setIsLoading(false);
      }
    }

    fetchListings().finally(() => setIsLoading(false));
  }, []);

  const filteredListings = useMemo(() => {
    let result = [...allListings];

    if (filters.type !== "all") {
      result = result.filter((l) => l.type === filters.type);
    }

    if (filters.category !== "All") {
      result = result.filter((l) => l.category === filters.category);
    }

    if (filters.color !== "All") {
      result = result.filter(
        (l) => (l.color || "").toLowerCase() === filters.color.toLowerCase()
      );
    }

    if (filters.zone !== "All") {
      result = result.filter((l) => l.campusZone === filters.zone);
    }

    if (filters.status !== "All") {
      result = result.filter((l) => l.status === filters.status);
    }

    if (filters.search.trim()) {
      const query = filters.search.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          l.description.toLowerCase().includes(query) ||
          l.location.toLowerCase().includes(query) ||
          (l.brand && l.brand.toLowerCase().includes(query)) ||
          l.detectedLabels.some((lbl) => lbl.name.toLowerCase().includes(query))
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date).getTime();
      const dateB = new Date(b.createdAt || b.date).getTime();
      return filters.sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [allListings, filters]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Explore Campus Listings
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Browse, filter, and search through verified lost reports and turned-in items.
        </p>
      </div>

      <ListingFilters
        filters={filters}
        onChange={setFilters}
        categories={CATEGORIES}
        zones={ZONES}
      />

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-900 dark:text-white">{filteredListings.length}</strong> of{" "}
          {allListings.length} listings
        </span>
      </div>

      <ListingGrid
        listings={filteredListings}
        isLoading={isLoading}
        emptyTitle="No listings match your search criteria"
        emptyDescription="Try clearing your search query or adjusting your category/zone filters."
      />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading listings...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
