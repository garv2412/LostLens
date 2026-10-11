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
    try {
      const currentStats = DemoStore.getSystemStats();
      const allListings = DemoStore.getListings();
      const allMatches = DemoStore.getAllMatches();
      const notifications = DemoStore.getNotifications();

      setStats(currentStats);
      setRecentListings(allListings.slice(0, 4));
      setTopMatches(allMatches.filter((m) => m.strength === "strong").slice(0, 3));
      setRecentActivity(notifications.slice(0, 5));
    } catch {
      // pass
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="space-y-8 pb-8">
      {/* Top Banner: Greeting & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Campus Recovery Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time overview of lost reports, turned-in items, and AI match candidates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/report?type=lost">
            <Button variant="outline" size="sm" className="gap-1.5 font-semibold">
              <PlusCircle className="h-4 w-4 text-amber-600" />
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
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Active Listings
          </span>
          <div className="text-2xl font-black text-slate-900">
            {stats ? stats.totalListings - stats.recoveredCount : "..."}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 5 campus sectors
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Lost Reports
          </span>
          <div className="text-2xl font-black text-amber-600">
            {stats ? stats.lostCount : "..."}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Awaiting discovery
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Found Items
          </span>
          <div className="text-2xl font-black text-indigo-600">
            {stats ? stats.foundCount : "..."}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Turned in to desks
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Potential Matches
          </span>
          <div className="text-2xl font-black text-indigo-900 flex items-center gap-1.5">
            <span>{stats ? stats.activeMatches : "..."}</span>
            <Sparkles className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Candidate rankings ready
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Recovered Rate
          </span>
          <div className="text-2xl font-black text-emerald-600 flex items-center gap-1.5">
            <span>{stats ? `${stats.resolutionRate}%` : "..."}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats ? `${stats.recoveredCount} items returned` : ""}
          </div>
        </div>
      </div>

      {/* Main Row: Activity Chart & Recent High-Quality Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols on lg) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                Reporting & Recovery Trajectory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily volume of lost reports, found items, and verified returns
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              Last 10 Days
            </span>
          </div>

          <ActivityTrendChart />
        </div>

        {/* Top AI Matches (1 col on lg) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                Top AI Candidates
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Highest ranked potential matches
              </p>
            </div>
            <Link
              href="/matches"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View all
            </Link>
          </div>

          <div className="flex-1 space-y-3">
            {topMatches.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No candidate matches above threshold yet.
              </div>
            ) : (
              topMatches.map((match) => (
                <Link
                  key={match.id}
                  href={`/matches?inspect=${match.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-indigo-50/40 hover:border-indigo-100 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {match.lostListing?.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
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
              <h2 className="font-bold text-base text-slate-900">
                Recently Submitted Listings
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest reports added across campus
              </p>
            </div>
            <Link
              href="/explore"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
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
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4 flex flex-col">
          <div>
            <h2 className="font-bold text-sm text-slate-900">
              Recent System Activity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Notifications & recovery state changes
            </p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {recentActivity.map((notif) => (
              <div
                key={notif.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate max-w-[70%]">
                    {notif.title}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatRelativeTime(notif.createdAt)}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
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
