"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { ActivityTrendChart } from "@/components/visualizations/ActivityTrendChart";
import { CategoryDistributionChart } from "@/components/visualizations/CategoryDistributionChart";
import { DemoStore } from "@/lib/demo/store";
import { SystemStats } from "@/lib/types/user";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    try {
      const data = DemoStore.getSystemStats();
      setStats(data);
    } catch {
      // pass
    }
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Recovery & Intelligence Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Quantitative metrics derived from active campus reports, Rekognition analyses, and claim decisions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Total Listings Analyzed
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stats ? stats.totalListings : "..."}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{stats?.lostCount} lost</span>
            <span>•</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{stats?.foundCount} found</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Recovery Success Rate
          </span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {stats ? `${stats.resolutionRate}%` : "..."}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {stats?.recoveredCount} items handed back
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            AI Candidates Generated
          </span>
          <div className="text-3xl font-black text-indigo-700 dark:text-indigo-400">
            {stats ? stats.activeMatches : "..."}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            High & moderate compatibility
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Average Recovery Velocity
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stats ? `${stats.averageRecoveryDays}d` : "..."}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            From filing to ownership claim
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trajectory */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Reporting Trajectory (Past 10 Days)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Lost vs found submissions and recovery resolution trends
            </p>
          </div>
          <ActivityTrendChart />
        </div>

        {/* Top Categories */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Distribution by Item Category
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Categories with the highest incidence of campus recovery
            </p>
          </div>
          <CategoryDistributionChart />
        </div>
      </div>

      {/* Methodological Context & Sample Size Transparency */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
        <p className="font-bold text-slate-800 dark:text-slate-200">
          Data Integrity & Sample Size Note:
        </p>
        <p>
          These operational metrics are calculated dynamically from underlying listings in your active session (sample size: {stats?.totalListings || 0} listings). In accordance with reporting guidelines, percentages reflect actual recorded state rather than synthesized claims.
        </p>
      </div>
    </div>
  );
}
