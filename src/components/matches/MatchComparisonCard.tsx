"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  Check,
  X,
} from "lucide-react";
import { MatchCandidate } from "@/lib/types/match";
import { ScoreIndicator } from "./ScoreIndicator";
import { Button } from "../ui/Button";
import { formatDate } from "@/lib/utils/formatters";

export interface MatchComparisonCardProps {
  candidate: MatchCandidate;
  onInspect: (candidate: MatchCandidate) => void;
  onConfirm?: (matchId: string) => void;
  onDismiss?: (matchId: string) => void;
}

export const MatchComparisonCard: React.FC<MatchComparisonCardProps> = ({
  candidate,
  onInspect,
  onConfirm,
  onDismiss,
}) => {
  const { lostListing: lost, foundListing: found, score, strength, explanation, status } =
    candidate;

  if (!lost || !found) return null;

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      {/* Top Bar: Match Score & Status */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
        <ScoreIndicator score={score} strength={strength} />
        <div className="flex items-center gap-2">
          {status === "confirmed" && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Check className="h-3 w-3" /> Confirmed
            </span>
          )}
          {status === "dismissed" && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
              <X className="h-3 w-3" /> Dismissed
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onInspect(candidate)}
            className="text-xs gap-1.5 h-8 font-semibold text-indigo-700 border-indigo-200 hover:bg-indigo-50"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Inspect Evidence</span>
          </Button>
        </div>
      </div>

      {/* Side-by-Side Comparison Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 p-4 gap-4 sm:gap-6">
        {/* Left: Lost Item */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 border border-amber-100">
              Lost Report
            </span>
            <span className="text-xs text-slate-400 font-mono">#{lost.id.slice(-6)}</span>
          </div>

          <div className="relative aspect-16/10 w-full rounded-lg overflow-hidden bg-slate-100">
            <Image
              src={lost.imageUrl}
              alt={lost.title}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <Link
              href={`/listings/${lost.id}`}
              className="font-semibold text-sm text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
            >
              {lost.title}
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
              <span>Color: <strong className="text-slate-700">{lost.color}</strong></span>
              <span>•</span>
              <span>Zone: <strong className="text-slate-700">{lost.campusZone}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1.5">
              <Calendar className="h-3 w-3" />
              <span>Lost on {formatDate(lost.date)}</span>
            </div>
          </div>
        </div>

        {/* Right: Found Item */}
        <div className="space-y-3 sm:pl-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">
              Found Listing
            </span>
            <span className="text-xs text-slate-400 font-mono">#{found.id.slice(-6)}</span>
          </div>

          <div className="relative aspect-16/10 w-full rounded-lg overflow-hidden bg-slate-100">
            <Image
              src={found.imageUrl}
              alt={found.title}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <Link
              href={`/listings/${found.id}`}
              className="font-semibold text-sm text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
            >
              {found.title}
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
              <span>Color: <strong className="text-slate-700">{found.color}</strong></span>
              <span>•</span>
              <span>Zone: <strong className="text-slate-700">{found.campusZone}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1.5">
              <Calendar className="h-3 w-3" />
              <span>Found on {formatDate(found.date)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Explanation Snippet */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 text-xs">
        <p className="text-slate-700 line-clamp-2 leading-relaxed">
          <span className="font-semibold text-slate-900">Analysis: </span>
          {explanation.summary}
        </p>

        {/* Overlapping clues preview */}
        {explanation.matchingClues.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {explanation.matchingClues.slice(0, 2).map((clue, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100"
              >
                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                <span>{clue}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {onDismiss && status !== "dismissed" && (
            <button
              onClick={() => onDismiss(candidate.id)}
              className="text-slate-500 hover:text-slate-800 font-medium py-1 px-2 rounded hover:bg-slate-100 transition-colors"
            >
              Dismiss
            </button>
          )}
          {onConfirm && status !== "confirmed" && (
            <button
              onClick={() => onConfirm(candidate.id)}
              className="text-emerald-700 hover:text-emerald-900 font-semibold py-1 px-2.5 rounded bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              Confirm Match
            </button>
          )}
        </div>

        <Link
          href={`/listings/${found.id}`}
          className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          <span>Open Found Item</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};
