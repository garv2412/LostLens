"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, AlertTriangle, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
import { MatchCandidate } from "@/lib/types/match";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { ScoreIndicator } from "./ScoreIndicator";
import { formatDate } from "@/lib/utils/formatters";

export interface MatchBreakdownModalProps {
  candidate: MatchCandidate | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export const MatchBreakdownModal: React.FC<MatchBreakdownModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onConfirm,
  onDismiss,
}) => {
  if (!candidate || !candidate.lostListing || !candidate.foundListing) return null;

  const { lostListing: lost, foundListing: found, explanation, score, strength } = candidate;
  const { breakdown } = explanation;

  const components = [
    {
      name: "Visual Labels & Image Tags",
      weight: "35%",
      score: breakdown.visualLabels.score,
      details: breakdown.visualLabels.overlappingLabels.length > 0
        ? `Overlapping tags: ${breakdown.visualLabels.overlappingLabels.join(", ")}`
        : "No direct visual label tags overlap",
    },
    {
      name: "Category Compatibility",
      weight: "20%",
      score: breakdown.category.score,
      details: breakdown.category.isMatch
        ? `Direct match: ${lost.category}`
        : `Reported "${lost.category}" vs "${found.category}"`,
    },
    {
      name: "Color Alignment",
      weight: "15%",
      score: breakdown.color.score,
      details: `Lost: "${lost.color || "None"}" | Found: "${found.color || "None"}" (${breakdown.color.status})`,
    },
    {
      name: "Campus Location & Zone",
      weight: "15%",
      score: breakdown.location.score,
      details: `Lost: ${lost.campusZone} | Found: ${found.campusZone} (${breakdown.location.proximityLevel.replace("_", " ")})`,
    },
    {
      name: "Temporal Proximity",
      weight: "10%",
      score: breakdown.temporal.score,
      details: breakdown.temporal.orderValid
        ? `Discovered ${breakdown.temporal.daysDifference} day(s) after reported loss`
        : `Chronological anomaly: found date precedes loss date`,
    },
    {
      name: "Textual & Keyword Overlap",
      weight: "5%",
      score: breakdown.textSimilarity.score,
      details: breakdown.textSimilarity.commonKeywords.length > 0
        ? `Shared words: ${breakdown.textSimilarity.commonKeywords.slice(0, 4).join(", ")}`
        : "Minimal keyword overlap in descriptions",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Candidate Match Breakdown & Evidence"
      description={`AI ranking evaluation between report #${lost.id} and #${found.id}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Top Overview: Side by Side Thumbnails & Score */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          {/* Lost Item */}
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-slate-200 shrink-0">
              <Image
                src={lost.imageUrl}
                alt={lost.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                Lost Item
              </span>
              <h4 className="text-xs font-semibold text-slate-900 truncate">
                {lost.title}
              </h4>
              <p className="text-[11px] text-slate-500">
                {lost.location} • {formatDate(lost.date)}
              </p>
            </div>
          </div>

          {/* Found Item */}
          <div className="flex items-center gap-3 sm:border-l sm:border-slate-200 sm:pl-4">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-slate-200 shrink-0">
              <Image
                src={found.imageUrl}
                alt={found.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                Found Item
              </span>
              <h4 className="text-xs font-semibold text-slate-900 truncate">
                {found.title}
              </h4>
              <p className="text-[11px] text-slate-500">
                {found.location} • {formatDate(found.date)}
              </p>
            </div>
          </div>
        </div>

        {/* Total Score Banner */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
          <ScoreIndicator score={score} strength={strength} />
          <div className="text-right text-xs">
            <span className="font-semibold text-indigo-950">
              Candidate Status:
            </span>{" "}
            <span className="capitalize font-bold text-indigo-700">
              {candidate.status}
            </span>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="rounded-xl border border-slate-200 p-4 bg-white">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            Matching Summary
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed">
            {explanation.summary}
          </p>
        </div>

        {/* Supporting Clues & Conflicts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Clues */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3.5">
            <h5 className="font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Supporting Clues ({explanation.matchingClues.length})
            </h5>
            <ul className="space-y-1.5 text-slate-700">
              {explanation.matchingClues.map((clue, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{clue}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Conflicting Evidence */}
          <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-3.5">
            <h5 className="font-bold text-amber-800 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Conflicting / Missing Evidence ({explanation.conflictingEvidence.length})
            </h5>
            <ul className="space-y-1.5 text-slate-700">
              {explanation.conflictingEvidence.map((conf, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{conf}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 6-Factor Weighted Component Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Weighted Score Components
          </h4>
          <div className="space-y-2.5">
            {components.map((c) => (
              <div
                key={c.name}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/50"
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800">
                    {c.name}{" "}
                    <span className="text-slate-400 font-normal">
                      (Weight: {c.weight})
                    </span>
                  </span>
                  <span className="text-slate-900 font-bold">
                    {Math.round(c.score)} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.max(4, c.score)}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500">{c.details}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onDismiss) onDismiss(candidate.id);
              onClose();
            }}
          >
            Dismiss Match
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            {onConfirm && (
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  onConfirm(candidate.id);
                  onClose();
                }}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Confirm as Likely Match</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
