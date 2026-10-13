import React from "react";
import Link from "next/link";
import { SearchX, PlusCircle } from "lucide-react";
import { Listing } from "@/lib/types/listing";
import { ListingCard } from "./ListingCard";
import { Skeleton } from "../ui/Skeleton";
import { Button } from "../ui/Button";

export interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  isLoading = false,
  emptyTitle = "No listings found",
  emptyDescription = "Try adjusting your search criteria, clearing active filters, or submit a new report.",
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3"
          >
            <Skeleton className="aspect-4/3 w-full rounded-lg" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="pt-2 flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3 border border-slate-100 dark:border-slate-700">
          <SearchX className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-1">
          {emptyTitle}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
          {emptyDescription}
        </p>
        <Link href="/report">
          <Button variant="primary" size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Create New Report</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};
