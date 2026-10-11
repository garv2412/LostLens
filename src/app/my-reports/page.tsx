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

  const loadData = () => {
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
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Submitted Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
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
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900">
          <p className="font-semibold mb-0.5">
            Active Identity: {CURRENT_DEMO_USER.name} ({CURRENT_DEMO_USER.department})
          </p>
          <p className="text-indigo-800/80 leading-relaxed">
            In Demo Mode, listings matching this identity are grouped here. In Live AWS Mode with Amazon Cognito, identity is securely verified via university single-sign-on (SSO).
          </p>
        </div>
      </div>

      {/* Segment Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-1.5 rounded-xl text-xs w-fit shadow-2xs">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === "all"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          All Reports ({myListings.length})
        </button>
        <button
          onClick={() => setActiveTab("lost")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === "lost"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          My Lost Items ({lostCount})
        </button>
        <button
          onClick={() => setActiveTab("found")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === "found"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          My Found Items ({foundCount})
        </button>
      </div>

      {/* Grid of Listings */}
      {displayedListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
            <FolderHeart className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base mb-1">
            No reports in this category
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
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
