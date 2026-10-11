"use client";

import React, { useState } from "react";
import { Check, X, Shield, Lock, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Claim } from "@/lib/types/claim";
import { Button } from "../ui/Button";
import { formatDateTime } from "@/lib/utils/formatters";

export interface ClaimReviewCardProps {
  claim: Claim;
  onDecision: (claimId: string, decision: "accept" | "reject", note?: string) => Promise<void>;
  isListingOwner: boolean;
}

export const ClaimReviewCard: React.FC<ClaimReviewCardProps> = ({
  claim,
  onDecision,
  isListingOwner,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [decisionNote, setDecisionNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<"accept" | "reject" | null>(null);

  const handleAction = async (decision: "accept" | "reject") => {
    setIsProcessing(true);
    try {
      await onDecision(claim.id, decision, decisionNote);
      setShowNoteInput(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
            {claim.claimantName.charAt(0)}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">{claim.claimantName}</h4>
            <p className="text-[10px] text-slate-400">{formatDateTime(claim.createdAt)}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {claim.status === "pending" && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Pending Review
            </span>
          )}
          {claim.status === "accepted" && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Approved & Handed Over
            </span>
          )}
          {claim.status === "rejected" && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <XCircle className="h-3 w-3" /> Rejected
            </span>
          )}
        </div>
      </div>

      {/* Claim details body */}
      <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs space-y-2">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Claimant Distinguishing Details:
          </span>
          <p className="text-slate-800 font-medium leading-relaxed">
            {claim.distinguishingDetails}
          </p>
        </div>

        {claim.additionalProof && (
          <div className="pt-1 border-t border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Additional Verification Proof:
            </span>
            <p className="text-slate-600">{claim.additionalProof}</p>
          </div>
        )}

        {claim.decisionNote && (
          <div className="pt-1 border-t border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Resolution Note:
            </span>
            <p className="text-slate-600 italic">&ldquo;{claim.decisionNote}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Review Actions (only available if listing owner and pending) */}
      {isListingOwner && claim.status === "pending" && (
        <div className="pt-2 border-t border-slate-100">
          {showNoteInput ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Optional decision note (e.g., 'Verified serial, handed over at desk')..."
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNoteInput(false)}
                >
                  Back
                </Button>
                <Button
                  variant={pendingDecision === "accept" ? "primary" : "destructive"}
                  size="sm"
                  isLoading={isProcessing}
                  onClick={() => pendingDecision && handleAction(pendingDecision)}
                >
                  Confirm {pendingDecision === "accept" ? "Approval" : "Rejection"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                onClick={() => {
                  setPendingDecision("reject");
                  setShowNoteInput(true);
                }}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Reject Claim
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                onClick={() => {
                  setPendingDecision("accept");
                  setShowNoteInput(true);
                }}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Accept & Mark Recovered
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
