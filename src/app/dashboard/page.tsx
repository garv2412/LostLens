"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  PlusCircle,
  FolderHeart,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ListingCard } from "@/components/listings/ListingCard";
import { ScoreIndicator } from "@/components/matches/ScoreIndicator";
import { ActivityTrendChart } from "@/components/visualizations/ActivityTrendChart";
import { DemoStore } from "@/lib/demo/store";
import { Listing } from "@/lib/types/listing";
import { MatchCandidate } from "@/lib/types/match";
import { AppNotification } from "@/lib/types/notification";
import { SystemStats } from "@/lib/types/user";
import { formatRelativeTime } from "@/lib/utils/formatters";

export default function DashboardPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [topMatches, setTopMatches] = useState<MatchCandidate[]>([]);
  const [recentActivity, setRecentActivity] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      let listings = DemoStore.getListings();
      try {
        const res = await fetch("/api/listings");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          listings = json.data;
        }
      } catch {
        // pass
      }

      try {
        const currentStats = DemoStore.getSystemStats();
        const allMatches = DemoStore.getAllMatches();
        const notifications = DemoStore.getNotifications();

        setStats(currentStats);
        setRecentListings(listings.slice(0, 4));
        setTopMatches(allMatches.filter((m) => m.strength === "strong").slice(0, 3));
        setRecentActivity(notifications.slice(0, 5));
      } catch {
        // pass
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-8 pb-8">
      {/* Top Banner: Greeting & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Campus Recovery Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time overview of lost reports, turned-in items, and AI match candidates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/report?type=lost">
            <Button variant="outline" size="sm" className="gap-1.5 font-semibold">
              <PlusCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Report Lost</span>
            </Button>
          </Link>
          <Link href="/report?type=found">
            <Button variant="primary" size="sm" className="gap-1.5 font-semibold">
              <PlusCircle className="h-4 w-4" />
              <span>Report Found</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Active Listings
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats ? stats.totalListings - stats.recoveredCount : "..."}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
            Across 5 campus sectors
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Lost Reports
          </span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats ? stats.lostCount : "..."}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
            Awaiting discovery
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Found Items
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {stats ? stats.foundCount : "..."}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
            Turned in to desks
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Potential Matches
          </span>
          <div className="text-2xl font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
            <span>{stats ? stats.activeMatches : "..."}</span>
            <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
            Candidate rankings ready
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs col-span-2 lg:col-span-1 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Recovered Rate
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span>{stats ? `${stats.resolutionRate}%` : "..."}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
            {stats ? `${stats.recoveredCount} items returned` : ""}
          </div>
        </div>
      </div>

      {/* Main Row: Activity Chart & Recent High-Quality Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols on lg) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Reporting & Recovery Trajectory
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Daily volume of lost reports, found items, and verified returns
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
              Last 10 Days
            </span>
          </div>

          <ActivityTrendChart />
        </div>

        {/* Top AI Matches (1 col on lg) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Top AI Candidates
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Highest ranked potential matches
              </p>
            </div>
            <Link
              href="/matches"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              View all
            </Link>
          </div>

          <div className="flex-1 space-y-3">
            {topMatches.length === 0 ? (
              <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                No candidate matches above threshold yet.
              </div>
            ) : (
              topMatches.map((match) => (
                <Link
                  key={match.id}
                  href={`/matches?inspect=${match.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 hover:border-indigo-100 dark:hover:border-indigo-900/60 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {match.lostListing?.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                      ↔ {match.foundListing?.title}
                    </p>
                  </div>
                  <ScoreIndicator score={match.score} strength={match.strength} size="sm" />
                </Link>
              ))
            )}
          </div>

          <Link href="/matches" className="pt-2">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Open Matching Workspace →
            </Button>
          </Link>
        </div>
      </div>

      {/* Secondary Row: Recent Listings Grid & System Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Listings (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Recently Submitted Listings
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Latest reports added across campus
              </p>
            </div>
            <Link
              href="/explore"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Explore all {stats?.totalListings}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>

        {/* System Activity Feed (1 col) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4 flex flex-col">
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Recent System Activity
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Notifications & recovery state changes
            </p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {recentActivity.map((notif) => (
              <div
                key={notif.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-[70%]">
                    {notif.title}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {formatRelativeTime(notif.createdAt)}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                  {notif.message}
                </p>
              </div>
            ))}
          </div>

          <Link href="/my-reports" className="pt-2">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Manage My Personal Reports →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
