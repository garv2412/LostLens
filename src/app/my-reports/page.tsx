"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderHeart,
  PlusCircle,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ListingCard } from "@/components/listings/ListingCard";
import { DemoStore } from "@/lib/demo/store";
import { Listing } from "@/lib/types/listing";
import { CURRENT_DEMO_USER } from "@/lib/demo/seedData";

export default function MyReportsPage() {
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "lost" | "found">("all");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetch("/api/listings");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const mine = (json.data as Listing[]).filter((l) => l.reporterId === CURRENT_DEMO_USER.id);
        setMyListings(mine);
        setIsLoading(false);
        return;
      }
    } catch {
      // pass
    }

    try {
      const all = DemoStore.getListings();
      // Filter listings reported by active demo user
      const mine = all.filter((l) => l.reporterId === CURRENT_DEMO_USER.id);
      setMyListings(mine);
    } catch {
      // pass
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const displayedListings = myListings.filter((l) => {
    if (activeTab === "lost") return l.type === "lost";
    if (activeTab === "found") return l.type === "found";
    return true;
  });

  const lostCount = myListings.filter((l) => l.type === "lost").length;
  const foundCount = myListings.filter((l) => l.type === "found").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Submitted Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage your personal lost and found filings, inspect claim requests, and track recovery.
          </p>
        </div>

        <Link href="/report">
          <Button variant="primary" size="sm" className="gap-1.5 self-start sm:self-auto font-semibold">
            <PlusCircle className="h-4 w-4" />
            <span>Create New Report</span>
          </Button>
        </Link>
      </div>

      {/* Demo Persona Notification Note */}
      <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/40 p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 dark:text-indigo-200">
          <p className="font-semibold mb-0.5">
            Active Identity: {CURRENT_DEMO_USER.name} ({CURRENT_DEMO_USER.department})
          </p>
          <p className="text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
            In Demo Mode, listings matching this identity are grouped here. In Live AWS Mode with Amazon Cognito, identity is securely verified via university single-sign-on (SSO).
          </p>
        </div>
      </div>

      {/* Segment Tabs */}
      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1.5 rounded-xl text-xs w-fit shadow-2xs">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === "all"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          All Reports ({myListings.length})
        </button>
        <button
          onClick={() => setActiveTab("lost")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === "lost"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          My Lost Items ({lostCount})
        </button>
        <button
          onClick={() => setActiveTab("found")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === "found"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          My Found Items ({foundCount})
        </button>
      </div>

      {/* Grid of Listings */}
      {displayedListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3 border border-slate-100 dark:border-slate-700">
            <FolderHeart className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-1">
            No reports in this category
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mb-4">
            You haven&apos;t filed any items in this tab yet.
          </p>
          <Link href="/report">
            <Button variant="primary" size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Submit a Report</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {displayedListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
