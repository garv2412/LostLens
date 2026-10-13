"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Search,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  Layers,
  Clock,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DemoStore } from "@/lib/demo/store";
import { SystemStats } from "@/lib/types/user";

export default function LandingPage() {
  const [stats, setStats] = useState<SystemStats>({
    totalListings: 24,
    lostCount: 12,
    foundCount: 12,
    activeMatches: 9,
    recoveredCount: 6,
    resolutionRate: 25,
    averageRecoveryDays: 1.8,
  });

  useEffect(() => {
    try {
      const data = DemoStore.getSystemStats();
      setStats(data);
    } catch {
      // pass
    }
  }, []);

  return (
    <div className="space-y-16 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-slate-950 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white p-8 sm:p-14 lg:p-16 overflow-hidden shadow-2xl border border-indigo-900/60 dark:border-indigo-800/40">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-xs font-semibold backdrop-blur-sm shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            <span>AI-Assisted Multi-Attribute Matching</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Lost on campus? <br />
            <span className="bg-gradient-to-r from-indigo-200 via-purple-200 to-amber-300 bg-clip-text text-transparent drop-shadow-xs">
              Recovered in hours.
            </span>
          </h1>

          <p className="text-slate-200 text-sm sm:text-lg leading-relaxed max-w-2xl font-normal">
            LostLens automatically discovers, ranks, and explains potential matches between lost and found reports using Amazon Rekognition visual tags, campus geography, and deterministic weighted compatibility.
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link href="/report?type=lost">
              <Button
                variant="primary"
                size="lg"
                className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Report Lost Item</span>
              </Button>
            </Link>

            <Link href="/report?type=found">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/25 hover:border-white/40 backdrop-blur-sm"
              >
                <span>Report Found Item</span>
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="lg"
                className="gap-2 text-indigo-200 hover:text-white hover:bg-white/10"
              >
                <span>View Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Campus Metric Counters */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Reports</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.totalListings}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {stats.lostCount} lost • {stats.foundCount} found
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Matches</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.activeMatches}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Identified by matching engine
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Items Recovered</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.recoveredCount}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Successfully returned to owners
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Recovery</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.averageRecoveryDays} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">days</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            From initial report to claim return
          </p>
        </div>
      </section>

      {/* Interactive Match Visual Demonstration */}
      <section className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mb-2">
              <Zap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Live Demonstration
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              How LostLens Matches Belongings
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Two students independently report a black backpack. LostLens analyzes the image tags, dates, and campus zones to link them automatically.
            </p>
          </div>
          <Link href="/matches">
            <Button variant="outline" size="sm" className="gap-1.5 self-start">
              <span>Explore All Matches</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Visual Pair Card */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center rounded-2xl bg-slate-50/80 dark:bg-slate-850/60 dark:bg-slate-800/30 p-4 sm:p-6 border border-slate-200/70 dark:border-slate-800">
          {/* Lost item */}
          <div className="md:col-span-5 rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                1. Lost Report Submitted
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Oct 09 • 14:30</span>
            </div>
            <div className="relative aspect-16/10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"
                alt="Lost Black Backpack"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Black Herschel Little America Backpack
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Location: North Library 2nd Floor (Library Quad)
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                  Tag: Backpack (99.4%)
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                  Tag: Canvas
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                  Color: Black
                </span>
              </div>
            </div>
          </div>

          {/* Center Connection Indicator */}
          <div className="md:col-span-1 flex flex-col items-center justify-center text-center my-2 md:my-0">
            <div className="h-11 w-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-500/30 ring-4 ring-indigo-50 dark:ring-slate-800">
              94%
            </div>
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mt-1.5">
              Rank #1
            </span>
          </div>

          {/* Found item */}
          <div className="md:col-span-5 rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                2. Found Item Turned In
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Oct 09 • 17:15</span>
            </div>
            <div className="relative aspect-16/10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src="https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=800&auto=format&fit=crop&q=80"
                alt="Found Black Backpack"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Found Black Herschel Canvas Backpack
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Location: North Library 2nd Floor Desk 24
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                  Tag: Backpack (99.8%)
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                  Tag: Straps
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                  Color: Black
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Recovery Process */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            A Transparent Recovery Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Designed for colleges, universities, libraries, and public community campuses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Snap & Report</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Submit a quick photo with the approximate location, date, and optional private ownership clues.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Tag Extraction</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Amazon Rekognition identifies object labels (e.g. backpack, water bottle, earbuds, electronics) with confidence metrics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Weighted Matching</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The matching engine calculates 6-factor compatibility and explains exactly why two items are candidates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-sm flex items-center justify-center">
              4
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Verify & Recover</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The rightful owner provides private proof, the finder approves the claim, and the item is marked recovered.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="rounded-3xl bg-slate-950 text-white p-8 sm:p-12 text-center space-y-4 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-indigo-600/15 blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Ready to discover your lost belongings?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Explore current campus listings or file a report in less than two minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link href="/explore">
              <Button variant="primary" size="md" className="bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30">
                Browse Active Listings
              </Button>
            </Link>
            <Link href="/report">
              <Button variant="outline" size="md" className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40">
                Submit a Report
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
