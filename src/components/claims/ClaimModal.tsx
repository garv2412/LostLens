"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Listing } from "@/lib/types/listing";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Input";
import { Input } from "../ui/Input";
import { CURRENT_DEMO_USER } from "@/lib/demo/seedData";

export interface ClaimModalProps {
  listing: Listing;
  matchId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  listing,
  matchId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [details, setDetails] = useState("");
  const [additionalProof, setAdditionalProof] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (details.trim().length < 15) {
      setError("Please provide at least 15 characters of specific ownership details.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          matchId,
          distinguishingDetails: details,
          additionalProof,
          claimantName: CURRENT_DEMO_USER.name,
          claimantEmail: CURRENT_DEMO_USER.email,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSubmitted(true);
        onSuccess();
      } else {
        setError(json.error || "Failed to submit claim. Please try again.");
      }
    } catch {
      setError("Network error while submitting claim.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setSubmitted(false);
    setDetails("");
    setAdditionalProof("");
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={submitted ? "Claim Submitted Successfully" : `Claim Item: ${listing.title}`}
      description={
        submitted
          ? "The reporter has been notified and will verify your ownership details."
          : "Provide confidential proof of ownership to verify and recover this item."
      }
      maxWidth="md"
    >
      {submitted ? (
        <div className="space-y-4 py-2">
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl bg-emerald-50 border border-emerald-100">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">
              Verification Request Sent
            </h4>
            <p className="text-xs text-slate-600 mt-1 max-w-xs leading-relaxed">
              We notified the finder. Once they review your distinguishing details, you will receive an in-app alert with return instructions.
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={handleModalClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-indigo-50/70 p-3 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
            <Lock className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              Your answers are <strong>private</strong> and visible only to the listing reporter and campus security to prevent fraudulent claims.
            </p>
          </div>

          <div>
            <Textarea
              label="Distinguishing Details / Ownership Proof *"
              placeholder="E.g., stickers on the device, unique scratches, lock screen message, specific items inside pockets, or serial numbers..."
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              error={error}
              required
            />
          </div>

          <div>
            <Input
              label="Purchase Receipt / Serial / Optional Note"
              placeholder="E.g., Apple invoice number, warranty code, or phone number..."
              value={additionalProof}
              onChange={(e) => setAdditionalProof(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleModalClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Submit Ownership Claim</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
