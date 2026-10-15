"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  SearchX,
} from "lucide-react";
import { MatchComparisonCard } from "@/components/matches/MatchComparisonCard";
import { MatchBreakdownModal } from "@/components/matches/MatchBreakdownModal";
import { Button } from "@/components/ui/Button";
import { DemoStore } from "@/lib/demo/store";
import { MatchCandidate, MatchStatus, MatchStrength } from "@/lib/types/match";

function MatchesContent() {
  const searchParams = useSearchParams();
  const inspectId = searchParams.get("inspect");

  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<MatchCandidate | null>(null);
  const [selectedStrength, setSelectedStrength] = useState<"all" | MatchStrength>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | MatchStatus>("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setMatches(json.data);
        if (inspectId) {
          const found = (json.data as MatchCandidate[]).find((m) => m.id === inspectId);
          if (found) setSelectedCandidate(found);
        }
        setIsLoading(false);
        return;
      }
    } catch {
      // pass
    }

    try {
      const all = DemoStore.getAllMatches();
      setMatches(all);

      if (inspectId) {
        const found = all.find((m) => m.id === inspectId);
        if (found) setSelectedCandidate(found);
      }
    } catch {
      // pass
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [inspectId]);

  const handleConfirmMatch = async (matchId: string) => {
    DemoStore.updateMatchStatus(matchId, "confirmed");
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: "confirmed" } : m))
    );
  };

  const handleDismissMatch = async (matchId: string) => {
    DemoStore.updateMatchStatus(matchId, "dismissed");
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: "dismissed" } : m))
    );
  };

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (selectedStrength !== "all" && m.strength !== selectedStrength) return false;
      if (selectedStatus !== "all" && m.status !== selectedStatus) return false;
      return true;
    });
  }, [matches, selectedStrength, selectedStatus]);

  const strongCount = matches.filter((m) => m.strength === "strong").length;
  const possibleCount = matches.filter((m) => m.strength === "possible").length;
  const weakCount = matches.filter((m) => m.strength === "weak").length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            Matching Engine Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Smart Match Candidates
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Compare lost and found reports ranked by visual tags, category, color, location, and dates.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchMatches}
          className="self-start sm:self-auto gap-1.5 text-xs text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Recalculate Rankings</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 shadow-2xs">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs overflow-x-auto">
          <button
            onClick={() => setSelectedStrength("all")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              selectedStrength === "all"
                ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            All Candidates ({matches.length})
          </button>
          <button
            onClick={() => setSelectedStrength("strong")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              selectedStrength === "strong"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Strong ({strongCount})
          </button>
          <button
            onClick={() => setSelectedStrength("possible")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              selectedStrength === "possible"
                ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Possible ({possibleCount})
          </button>
          <button
            onClick={() => setSelectedStrength("weak")}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              selectedStrength === "weak"
                ? "bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Weak ({weakCount})
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as "all" | MatchStatus)
            }
            className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="candidate">Unreviewed Candidates</option>
            <option value="confirmed">Confirmed Matches</option>
            <option value="dismissed">Dismissed Candidates</option>
          </select>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3 border border-slate-100 dark:border-slate-700">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-1">
            No candidate matches found
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mb-4">
            Try switching filter tabs or reset the demo dataset to view sample matches.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStrength("all");
              setSelectedStatus("all");
            }}
          >
            Reset Match Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMatches.map((candidate) => (
            <MatchComparisonCard
              key={candidate.id}
              candidate={candidate}
              onInspect={setSelectedCandidate}
              onConfirm={handleConfirmMatch}
              onDismiss={handleDismissMatch}
            />
          ))}
        </div>
      )}

      <MatchBreakdownModal
        candidate={selectedCandidate}
        isOpen={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        onConfirm={handleConfirmMatch}
        onDismiss={handleDismissMatch}
      />
    </div>
  );
}

export default function SmartMatchesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Smart Matches...</div>}>
      <MatchesContent />
    </Suspense>
  );
}
