"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Tag,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  User,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ListingTypeBadge, ListingStatusBadge } from "@/components/listings/ListingStatusBadge";
import { ScoreIndicator } from "@/components/matches/ScoreIndicator";
import { ClaimModal } from "@/components/claims/ClaimModal";
import { ClaimReviewCard } from "@/components/claims/ClaimReviewCard";
import { DemoStore } from "@/lib/demo/store";
import { Listing } from "@/lib/types/listing";
import { MatchCandidate } from "@/lib/types/match";
import { Claim } from "@/lib/types/claim";
import { CURRENT_DEMO_USER } from "@/lib/demo/seedData";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetch(`/api/listings/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setListing(json.data);
        const allMatches = DemoStore.getAllMatches();
        const related = allMatches.filter(
          (m) => m.lostListingId === json.data.id || m.foundListingId === json.data.id
        );
        setMatches(related);
        const itemClaims = DemoStore.getClaimsForListing(json.data.id);
        setClaims(itemClaims);
        setIsLoading(false);
        return;
      }
    } catch {
      // pass
    }

    try {
      const item = DemoStore.getListingById(id);
      if (item) {
        setListing(item);
        const allMatches = DemoStore.getAllMatches();
        const related = allMatches.filter(
          (m) => m.lostListingId === item.id || m.foundListingId === item.id
        );
        setMatches(related);
        const itemClaims = DemoStore.getClaimsForListing(item.id);
        setClaims(itemClaims);
      }
    } catch {
      // pass
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
        Loading listing details...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Listing Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The requested report #{id} does not exist or may have been deleted.
        </p>
        <Link href="/explore">
          <Button variant="primary" size="sm">
            Back to Explore
          </Button>
        </Link>
      </div>
    );
  }

  const isOwner = listing.reporterId === CURRENT_DEMO_USER.id;

  const handleClaimDecision = async (
    claimId: string,
    decision: "accept" | "reject",
    note?: string
  ) => {
    const res = await fetch("/api/claims", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimId, decision, decisionNote: note }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      DemoStore.saveClaim(json.data);
      if (decision === "accept") {
        DemoStore.updateListingStatus(listing.id, "resolved");
      }
    }
    loadData();
  };

  const handleStatusToggle = async (newStatus: "active" | "closed" | "resolved") => {
    DemoStore.updateListingStatus(listing.id, newStatus);
    loadData();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await fetch(`/api/listings/${listing.id}`, { method: "DELETE" });
      DemoStore.deleteListing(listing.id);
      router.push("/explore");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Back button & Action controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to previous page</span>
        </button>

        {isOwner && (
          <div className="flex items-center gap-2">
            {listing.status === "active" ? (
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                onClick={() => handleStatusToggle("closed")}
              >
                Close Report
              </Button>
            ) : listing.status === "closed" ? (
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                onClick={() => handleStatusToggle("active")}
              >
                Reopen Report
              </Button>
            ) : null}

            {listing.status !== "resolved" && (
              <Button
                variant="primary"
                size="sm"
                className="text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                onClick={() => handleStatusToggle("resolved")}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Mark as Recovered
              </Button>
            )}

            <Button
              variant="destructive"
              size="sm"
              className="text-xs gap-1"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Listing View (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Image & Rekognition Tags (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Image
              src={listing.imageUrl}
              alt={listing.title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <ListingTypeBadge type={listing.type} />
              <ListingStatusBadge status={listing.status} />
            </div>
          </div>

          {/* Amazon Rekognition Visual Tags */}
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                Amazon Rekognition Labels
              </h3>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                Visual Inference
              </span>
            </div>

            {listing.detectedLabels && listing.detectedLabels.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {listing.detectedLabels.map((lbl) => (
                  <span
                    key={lbl.name}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-100/80 dark:border-indigo-800/60"
                  >
                    <span>{lbl.name}</span>
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400">
                      {Math.round(lbl.confidence)}%
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500">No visual labels detected.</p>
            )}

            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
              Extracted via Rekognition image label analysis. Feeds into the candidate matching algorithm.
            </p>
          </div>
        </div>

        {/* Right: Metadata, Description, & Ownership Clues (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
              <Tag className="h-3.5 w-3.5" />
              <span>{listing.category}</span>
              {listing.brand && (
                <>
                  <span>•</span>
                  <span>Brand: {listing.brand}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {listing.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {listing.location} ({listing.campusZone})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <span>{formatDate(listing.date)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <span>Reported by {listing.reporterName}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Item Description
            </h3>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Distinguishing Features & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Primary Color
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {listing.color}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Distinguishing Marks
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-300">
                {listing.distinguishingFeatures || "None noted in public report"}
              </span>
            </div>
          </div>

          {/* Secret Verification Clue (Protected) */}
          <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/40 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                Private Ownership Verification Clue
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                {isOwner ? "Owner Visibility" : "Confidential"}
              </span>
            </div>

            {isOwner ? (
              <p className="text-xs text-indigo-900 dark:text-indigo-300 font-medium">
                {listing.secretVerificationClue || "No private verification clue set for this listing."}
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                Hidden from public view. The claimant must submit distinguishing details to verify ownership.
              </p>
            )}
          </div>

          {/* Claim Action for Found Items */}
          {listing.type === "found" && (listing.status === "active" || listing.status === "in_claim") && (
            <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-800/90 text-white border border-transparent dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm">
                    {isOwner ? "Submit Ownership Claim" : "Is this your belonging?"}
                  </h4>
                  {isOwner && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      Presentation Demo Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 dark:text-slate-400 mt-0.5">
                  {isOwner
                    ? "As the presenter, submit a confidential claim to verify distinguishing proof and trigger the recovery approval flow."
                    : "Submit a confidential claim to verify ownership with the finder."}
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsClaimModalOpen(true)}
                className="gap-1.5 shrink-0"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{isOwner ? "Submit Test Claim" : "Claim This Item"}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Submitted Claims Review Section (if any claims exist for this listing) */}
      {claims.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Ownership Claims Submitted ({claims.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {claims.map((claim) => (
              <ClaimReviewCard
                key={claim.id}
                claim={claim}
                onDecision={handleClaimDecision}
                isListingOwner={isOwner}
              />
            ))}
          </div>
        </section>
      )}

      {/* Candidate Matches Section */}
      <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Related Candidate Matches ({matches.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Opposite reports ranked by the AI matching engine
            </p>
          </div>
          <Link
            href="/matches"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            Open Matches Workspace →
          </Link>
        </div>

        {matches.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            No compatible opposite reports found above threshold.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m) => {
              const other = listing.type === "lost" ? m.foundListing : m.lostListing;
              if (!other) return null;

              return (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3 flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <ScoreIndicator score={m.score} strength={m.strength} size="sm" />
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                      {other.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                      <Image
                        src={other.imageUrl}
                        alt={other.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {other.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {other.location}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {m.explanation.summary}
                  </p>

                  <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                    <Link
                      href={`/listings/${other.id}`}
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                      Inspect Report →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Claim Modal */}
      <ClaimModal
        listing={listing}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSuccess={() => {
          setIsClaimModalOpen(false);
          loadData();
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete This Listing?"
        description="Are you sure you want to permanently delete this report? This will remove all associated candidate matches and claim records."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Report <strong>&ldquo;{listing.title}&rdquo;</strong> will be permanently removed from the system. This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDelete}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              <span>Permanently Delete</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
