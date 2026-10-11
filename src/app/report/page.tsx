"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  UploadCloud,
  X,
  Sparkles,
  Lock,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { ItemCategory, ListingType } from "@/lib/types/listing";
import { CURRENT_DEMO_USER } from "@/lib/demo/seedData";
import { MatchCandidate } from "@/lib/types/match";

const CATEGORIES: ItemCategory[] = [
  "Bags & Backpacks",
  "Water Bottles & Drinkware",
  "Earbuds & Headphones",
  "Electronics & Laptops",
  "Books & Notebooks",
  "Keys & Keychains",
  "Umbrellas & Rainwear",
  "Chargers & Cables",
  "Sports & Fitness",
  "Jewelry & Watches",
  "Wallets & Cards",
  "Eyewear & Glasses",
  "Clothing & Jackets",
  "Other",
];

const ZONES = [
  "Library Quad",
  "Science Complex",
  "Student Center",
  "Athletics",
  "North Campus",
];

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = (searchParams.get("type") as ListingType) || "lost";

  const [type, setType] = useState<ListingType>(defaultType);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ItemCategory>(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("Black");
  const [brand, setBrand] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [campusZone, setCampusZone] = useState(ZONES[0]);
  const [distinguishingFeatures, setDistinguishingFeatures] = useState("");
  const [secretClue, setSecretClue] = useState("");

  const [imageUrl, setImageUrl] = useState<string>(
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"
  );
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [submissionResult, setSubmissionResult] = useState<{
    listingId: string;
    matches: MatchCandidate[];
    labels: { name: string; confidence: number }[];
  } | null>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Only image files (JPEG, PNG, WEBP) are allowed.");
      return;
    }

    setUploadProgress(10);
    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        setUploadProgress(70);
        setTimeout(() => {
          setImageUrl(reader.result as string);
          setUploadProgress(null);
        }, 300);
      }, 200);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim() || title.length < 3) {
      setFormError("Please enter a valid descriptive title (at least 3 characters).");
      return;
    }
    if (!description.trim() || description.length < 10) {
      setFormError("Please provide a description with at least 10 characters.");
      return;
    }
    if (!location.trim()) {
      setFormError("Please specify the exact location where the item was lost or found.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          category,
          description,
          imageUrl,
          color,
          brand,
          date,
          time,
          location,
          campusZone,
          distinguishingFeatures,
          secretVerificationClue: secretClue,
          reporterName: CURRENT_DEMO_USER.name,
          reporterEmail: CURRENT_DEMO_USER.email,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSubmissionResult({
          listingId: json.data.listing.id,
          matches: json.data.matches || [],
          labels: json.data.detectedLabels || [],
        });
      } else {
        setFormError(json.error || "Submission failed. Please check the inputs.");
      }
    } catch {
      setFormError("Network error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6 animate-fade-in">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-8 text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {type === "lost" ? "Lost Report Registered" : "Found Item Registered"}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Your listing has been saved and analyzed. Rekognition visual tags have been extracted and cross-referenced against all compatible records.
          </p>

          {submissionResult.labels.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Detected Visual Labels:
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {submissionResult.labels.map((lbl) => (
                  <span
                    key={lbl.name}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-white text-indigo-700 border border-indigo-100 shadow-2xs"
                  >
                    {lbl.name} ({Math.round(lbl.confidence)}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Potential Matches Discovered ({submissionResult.matches.length})</span>
            </h3>
            <Link
              href="/matches"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Matching Workspace →
            </Link>
          </div>

          {submissionResult.matches.length > 0 ? (
            <div className="space-y-3">
              {submissionResult.matches.slice(0, 3).map((match) => (
                <div
                  key={match.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {type === "lost" ? match.foundListing?.title : match.lostListing?.title}
                    </h4>
                    <p className="text-slate-500 mt-0.5 line-clamp-1">
                      {match.explanation.summary}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-base font-black text-indigo-600">
                      {Math.round(match.score)}%
                    </span>
                    <span className="text-[10px] block text-slate-400 capitalize">
                      {match.strength}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
              No compatible match candidates discovered yet. You will be notified automatically if another student posts an overlapping item.
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Link href={`/listings/${submissionResult.listingId}`}>
              <Button variant="primary" size="sm">
                View My Listing Details
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" size="sm">
                Return to Explore
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          File a Campus Report
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Submit details and a photo to enable instant AI visual extraction and candidate matching.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Report Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("lost")}
              className={`py-3 px-4 rounded-lg font-bold text-sm border text-center transition-all ${
                type === "lost"
                  ? "bg-amber-50 text-amber-800 border-amber-300 shadow-xs ring-2 ring-amber-400/20"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              I Lost An Item
            </button>
            <button
              type="button"
              onClick={() => setType("found")}
              className={`py-3 px-4 rounded-lg font-bold text-sm border text-center transition-all ${
                type === "found"
                  ? "bg-indigo-50 text-indigo-800 border-indigo-300 shadow-xs ring-2 ring-indigo-400/20"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              I Found An Item
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Item Photograph *
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
              {imageUrl ? (
                <>
                  <Image
                    src={imageUrl}
                    alt="Upload preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-colors"
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="text-center p-4 text-slate-400 text-xs">
                  No image selected
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all text-center">
                <UploadCloud className="h-8 w-8 text-indigo-500 mb-2" />
                <span className="text-xs font-semibold text-slate-800">
                  Click to browse or drop photo
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  JPEG, PNG, WEBP up to 10MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>

              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Uploading photo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Clear photos enable Amazon Rekognition to extract high-accuracy visual labels.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <Input
            label="Item Title *"
            placeholder="e.g. Black Herschel Little America Backpack"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="Primary Color *"
                placeholder="e.g. Black, Navy Blue, Silver"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Brand / Manufacturer (if known)"
                placeholder="e.g. Apple, Hydro Flask, Nike, Herschel"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Date Lost or Found *"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <Textarea
            label="Item Description *"
            placeholder="Describe the item, what it was carrying, recent context, and any visible identifying marks..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Campus Sector / Zone *
              </label>
              <select
                value={campusZone}
                onChange={(e) => setCampusZone(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="Specific Location / Room *"
                placeholder="e.g. North Library 2nd Floor Study Room 24"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <Input
            label="Distinguishing Visible Features (Public)"
            placeholder="e.g. Brass carabiner on strap, sticker on lid, minor scratch on bottom"
            value={distinguishingFeatures}
            onChange={(e) => setDistinguishingFeatures(e.target.value)}
          />
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-5 shadow-2xs space-y-3">
          <div className="flex items-start gap-2.5">
            <Lock className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-950">
                Private Ownership Verification Clue (Optional)
              </h3>
              <p className="text-xs text-indigo-900/80 mt-0.5 leading-relaxed">
                This detail is <strong>never displayed publicly</strong> on the listing page. Only you and campus security can see it to verify rightful ownership.
              </p>
            </div>
          </div>

          <Textarea
            placeholder="e.g. Enamel whale pin hidden inside zipper pocket, laptop serial number ending in 9X4B..."
            rows={2}
            value={secretClue}
            onChange={(e) => setSecretClue(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <Link href="/explore">
            <Button type="button" variant="ghost" size="md">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="gap-2 px-8 font-bold"
          >
            <Sparkles className="h-5 w-5" />
            <span>Submit Report & Analyze</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Report Form...</div>}>
      <ReportContent />
    </Suspense>
  );
}
