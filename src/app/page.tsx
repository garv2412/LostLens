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
      <section className="relative rounded-3xl bg-linear-to-b from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-14 lg:p-16 overflow-hidden shadow-xl border border-indigo-900/50">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI-Assisted Multi-Attribute Matching</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Lost on campus? <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 via-purple-300 to-amber-200">
              Recovered in hours.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-lg leading-relaxed max-w-2xl font-normal">
            LostLens automatically discovers, ranks, and explains potential matches between lost and found reports using Amazon Rekognition visual tags, campus geography, and deterministic weighted compatibility.
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link href="/report?type=lost">
              <Button
                variant="primary"
                size="lg"
                className="gap-2 bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/25"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Report Lost Item</span>
              </Button>
            </Link>

            <Link href="/report?type=found">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-xs"
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
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Reports</span>
            <Layers className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.totalListings}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {stats.lostCount} lost • {stats.foundCount} found
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Matches</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.activeMatches}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Identified by matching engine
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Items Recovered</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.recoveredCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Successfully returned to owners
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Recovery Time</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stats.averageRecoveryDays} <span className="text-sm font-semibold text-slate-500">days</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            From initial report to claim return
          </p>
        </div>
      </section>

      {/* Interactive Match Visual Demonstration */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 mb-2">
              <Zap className="h-3.5 w-3.5" />
              Live Demonstration
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              How LostLens Matches Belongings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
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
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center rounded-2xl bg-slate-50/70 p-4 sm:p-6 border border-slate-200/70">
          {/* Lost item */}
          <div className="md:col-span-5 rounded-xl bg-white p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                1. Lost Report Submitted
              </span>
              <span className="text-[11px] text-slate-400">Oct 09 • 14:30</span>
            </div>
            <div className="relative aspect-16/10 rounded-lg overflow-hidden bg-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"
                alt="Lost Black Backpack"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Black Herschel Little America Backpack
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Location: North Library 2nd Floor (Library Quad)
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  Tag: Backpack (99.4%)
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  Tag: Canvas
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  Color: Black
                </span>
              </div>
            </div>
          </div>

          {/* Center Connection Indicator */}
          <div className="md:col-span-1 flex flex-col items-center justify-center text-center my-2 md:my-0">
            <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-300">
              94%
            </div>
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mt-1.5">
              Rank #1
            </span>
          </div>

          {/* Found item */}
          <div className="md:col-span-5 rounded-xl bg-white p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-800 border border-indigo-200">
                2. Found Item Turned In
              </span>
              <span className="text-[11px] text-slate-400">Oct 09 • 17:15</span>
            </div>
            <div className="relative aspect-16/10 rounded-lg overflow-hidden bg-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=800&auto=format&fit=crop&q=80"
                alt="Found Black Backpack"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Found Black Herschel Canvas Backpack
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Location: North Library 2nd Floor Desk 24
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  Tag: Backpack (99.8%)
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  Tag: Straps
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
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
          <h2 className="text-2xl font-bold text-slate-900">
            A Transparent Recovery Workflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Designed for colleges, universities, libraries, and public community campuses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 font-black text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900">Snap & Report</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Submit a quick photo with the approximate location, date, and optional private ownership clues.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 font-black text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900">AI Tag Extraction</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Amazon Rekognition identifies object labels (e.g. backpack, water bottle, earbuds, electronics) with confidence metrics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 font-black text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900">Weighted Matching</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The matching engine calculates 6-factor compatibility and explains exactly why two items are candidates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 font-black text-sm flex items-center justify-center">
              4
            </div>
            <h3 className="font-bold text-sm text-slate-900">Verify & Recover</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The rightful owner provides private proof, the finder approves the claim, and the item is marked recovered.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="rounded-2xl bg-slate-900 text-white p-8 sm:p-12 text-center space-y-4">
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
          Ready to discover your lost belongings?
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Explore current campus listings or file a report in less than two minutes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/explore">
            <Button variant="primary" size="md">
              Browse Active Listings
            </Button>
          </Link>
          <Link href="/report">
            <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20">
              Submit a Report
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
