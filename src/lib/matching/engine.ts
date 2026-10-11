import { Listing } from "../types/listing";
import {
  MatchCandidate,
  MatchStrength,
  ScoreComponentBreakdown,
} from "../types/match";
import { DEFAULT_THRESHOLDS, DEFAULT_WEIGHTS, MatchingWeights } from "./weights";
import { generateMatchExplanation } from "./explain";

// Color affinity map for fuzzy color matching
const COLOR_FAMILIES: Record<string, string[]> = {
  black: ["black", "dark gray", "charcoal", "slate", "grey", "gray"],
  white: ["white", "cream", "silver", "ivory", "off-white"],
  blue: ["blue", "navy", "cyan", "teal", "royal blue", "light blue", "denim"],
  red: ["red", "maroon", "burgundy", "crimson", "coral"],
  green: ["green", "olive", "forest green", "mint", "emerald"],
  yellow: ["yellow", "gold", "mustard", "amber"],
  purple: ["purple", "violet", "lavender", "plum"],
  brown: ["brown", "tan", "khaki", "beige", "bronze", "leather"],
  pink: ["pink", "rose", "magenta"],
  orange: ["orange", "peach", "rust"],
  gray: ["gray", "grey", "silver", "charcoal", "dark gray"],
};

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with", "of",
  "item", "lost", "found", "my", "was", "is", "it", "has", "have", "left",
  "near", "inside", "around", "color", "please", "help"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

// 1. Visual Labels Overlap (0 - 100)
function computeVisualLabelsScore(lost: Listing, found: Listing): {
  score: number;
  overlappingLabels: string[];
} {
  const lostLabels = (lost.detectedLabels || []).map((l) => l.name.toLowerCase());
  const foundLabels = (found.detectedLabels || []).map((l) => l.name.toLowerCase());

  // Also extract text keywords from title/desc for pseudo-labels if detected labels are scarce
  const lostTokens = tokenize(`${lost.title} ${lost.description}`);
  const foundTokens = tokenize(`${found.title} ${found.description}`);

  if (lostLabels.length === 0 && foundLabels.length === 0) {
    // Missing visual labels on both: do not award high score, evaluate fallback keyword overlap
    const sharedTokens = lostTokens.filter((t) => foundTokens.includes(t));
    if (sharedTokens.length > 0) {
      return { score: Math.min(40, sharedTokens.length * 15), overlappingLabels: sharedTokens.slice(0, 3) };
    }
    return { score: 15, overlappingLabels: [] };
  }

  // Cross-compare detected labels with each other and with item descriptions
  const overlapping = new Set<string>();

  for (const lLabel of lostLabels) {
    for (const fLabel of foundLabels) {
      if (lLabel === fLabel || lLabel.includes(fLabel) || fLabel.includes(lLabel)) {
        overlapping.add(lLabel);
      }
    }
    // Also check if lost label is described in found text
    if (foundTokens.includes(lLabel)) {
      overlapping.add(lLabel);
    }
  }

  for (const fLabel of foundLabels) {
    if (lostTokens.includes(fLabel)) {
      overlapping.add(fLabel);
    }
  }

  const overlapList = Array.from(overlapping).map(
    (l) => l.charAt(0).toUpperCase() + l.slice(1)
  );
  const totalDistinct = new Set([...lostLabels, ...foundLabels]).size || 1;

  if (overlapList.length === 0) {
    return { score: 0, overlappingLabels: [] };
  }

  // Jaccard-like score with minimum baseline when direct matches are present
  const rawRatio = overlapList.length / Math.min(lostLabels.length || 1, foundLabels.length || 1);
  const score = Math.min(100, Math.round(rawRatio * 75 + overlapList.length * 10));

  return { score, overlappingLabels: overlapList };
}

// 2. Category Compatibility (0 - 100)
function computeCategoryScore(lost: Listing, found: Listing): {
  score: number;
  isMatch: boolean;
} {
  if (lost.category === found.category) {
    return { score: 100, isMatch: true };
  }

  // Related categories
  const relatedCategories: [string, string][] = [
    ["Electronics & Laptops", "Chargers & Cables"],
    ["Bags & Backpacks", "Clothing & Jackets"],
    ["Jewelry & Watches", "Wallets & Cards"],
  ];

  const isRelated = relatedCategories.some(
    ([c1, c2]) =>
      (lost.category === c1 && found.category === c2) ||
      (lost.category === c2 && found.category === c1)
  );

  return {
    score: isRelated ? 40 : 0,
    isMatch: false,
  };
}

// 3. Color Similarity (0 - 100)
function computeColorScore(lost: Listing, found: Listing): {
  score: number;
  status: "exact" | "compatible" | "mismatch" | "unknown";
} {
  const lColor = (lost.color || "").trim().toLowerCase();
  const fColor = (found.color || "").trim().toLowerCase();

  if (!lColor || !fColor) {
    return { score: 30, status: "unknown" }; // Explicit missing attribute handling
  }

  if (lColor === fColor) {
    return { score: 100, status: "exact" };
  }

  // Check if they share any color family
  for (const [, colors] of Object.entries(COLOR_FAMILIES)) {
    const lMatch = colors.some((c) => lColor.includes(c) || c.includes(lColor));
    const fMatch = colors.some((c) => fColor.includes(c) || c.includes(fColor));
    if (lMatch && fMatch) {
      return { score: 75, status: "compatible" };
    }
  }

  return { score: 0, status: "mismatch" };
}

// 4. Location Compatibility (0 - 100)
function computeLocationScore(lost: Listing, found: Listing): {
  score: number;
  zoneMatch: boolean;
  proximityLevel: "same_building" | "same_zone" | "nearby" | "different_zone" | "unknown";
} {
  const lLoc = (lost.location || "").toLowerCase().trim();
  const fLoc = (found.location || "").toLowerCase().trim();
  const lZone = (lost.campusZone || "").toLowerCase().trim();
  const fZone = (found.campusZone || "").toLowerCase().trim();

  if (!lZone || !fZone) {
    return { score: 25, zoneMatch: false, proximityLevel: "unknown" };
  }

  if (lLoc && fLoc && (lLoc === fLoc || lLoc.includes(fLoc) || fLoc.includes(lLoc))) {
    return { score: 100, zoneMatch: true, proximityLevel: "same_building" };
  }

  if (lZone === fZone) {
    return { score: 85, zoneMatch: true, proximityLevel: "same_zone" };
  }

  // Adjacency heuristic
  const adjacentZones: [string, string][] = [
    ["library quad", "student center"],
    ["science complex", "engineering hall"],
    ["athletics", "recreation center"],
  ];

  const isNearby = adjacentZones.some(
    ([z1, z2]) =>
      (lZone.includes(z1) && fZone.includes(z2)) ||
      (lZone.includes(z2) && fZone.includes(z1))
  );

  if (isNearby) {
    return { score: 45, zoneMatch: false, proximityLevel: "nearby" };
  }

  return { score: 10, zoneMatch: false, proximityLevel: "different_zone" };
}

// 5. Temporal Proximity (0 - 100)
function computeTemporalScore(lost: Listing, found: Listing): {
  score: number;
  daysDifference: number;
  orderValid: boolean;
} {
  const lostDate = new Date(lost.date);
  const foundDate = new Date(found.date);

  if (isNaN(lostDate.getTime()) || isNaN(foundDate.getTime())) {
    return { score: 30, daysDifference: 0, orderValid: true };
  }

  const diffMs = foundDate.getTime() - lostDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Found item reported before lost item by more than 1 day is chronological anomaly
  if (diffDays < -1) {
    return { score: 5, daysDifference: diffDays, orderValid: false };
  }

  const absDays = Math.abs(diffDays);

  if (absDays === 0) return { score: 100, daysDifference: 0, orderValid: true };
  if (absDays <= 2) return { score: 90, daysDifference: absDays, orderValid: true };
  if (absDays <= 5) return { score: 75, daysDifference: absDays, orderValid: true };
  if (absDays <= 10) return { score: 60, daysDifference: absDays, orderValid: true };
  if (absDays <= 20) return { score: 40, daysDifference: absDays, orderValid: true };
  if (absDays <= 30) return { score: 20, daysDifference: absDays, orderValid: true };
  return { score: 5, daysDifference: absDays, orderValid: true };
}

// 6. Text Similarity (0 - 100)
function computeTextScore(lost: Listing, found: Listing): {
  score: number;
  commonKeywords: string[];
} {
  const lostTokens = tokenize(`${lost.title} ${lost.description} ${lost.distinguishingFeatures || ""}`);
  const foundTokens = tokenize(`${found.title} ${found.description} ${found.distinguishingFeatures || ""}`);

  const common = Array.from(new Set(lostTokens.filter((t) => foundTokens.includes(t))));

  if (common.length === 0) {
    return { score: 0, commonKeywords: [] };
  }

  const score = Math.min(100, common.length * 25);
  return { score, commonKeywords: common };
}

/**
 * Compare a Lost listing with a Found listing.
 * Returns null if listings are incompatible (e.g. comparing lost with lost, or closed listings).
 */
export function calculateMatchScore(
  lost: Listing,
  found: Listing,
  customWeights: MatchingWeights = DEFAULT_WEIGHTS
): {
  score: number;
  strength: MatchStrength;
  breakdown: ScoreComponentBreakdown;
} | null {
  // Validate listing types: must compare lost with found
  if (lost.type !== "lost" || found.type !== "found") {
    return null;
  }

  // Do not compare a report with itself
  if (lost.id === found.id) {
    return null;
  }

  // Exclude closed or already resolved listings from new matching candidates if not applicable
  if (lost.status === "closed" || found.status === "closed") {
    return null;
  }

  const visual = computeVisualLabelsScore(lost, found);
  const category = computeCategoryScore(lost, found);
  const color = computeColorScore(lost, found);
  const location = computeLocationScore(lost, found);
  const temporal = computeTemporalScore(lost, found);
  const text = computeTextScore(lost, found);

  const breakdown: ScoreComponentBreakdown = {
    visualLabels: {
      score: visual.score,
      weightedScore: visual.score * customWeights.visualLabels,
      weight: customWeights.visualLabels,
      overlappingLabels: visual.overlappingLabels,
    },
    category: {
      score: category.score,
      weightedScore: category.score * customWeights.category,
      weight: customWeights.category,
      isMatch: category.isMatch,
    },
    color: {
      score: color.score,
      weightedScore: color.score * customWeights.color,
      weight: customWeights.color,
      lostColor: lost.color,
      foundColor: found.color,
      status: color.status,
    },
    location: {
      score: location.score,
      weightedScore: location.score * customWeights.location,
      weight: customWeights.location,
      zoneMatch: location.zoneMatch,
      proximityLevel: location.proximityLevel,
    },
    temporal: {
      score: temporal.score,
      weightedScore: temporal.score * customWeights.temporal,
      weight: customWeights.temporal,
      daysDifference: temporal.daysDifference,
      orderValid: temporal.orderValid,
    },
    textSimilarity: {
      score: text.score,
      weightedScore: text.score * customWeights.textSimilarity,
      weight: customWeights.textSimilarity,
      commonKeywords: text.commonKeywords,
    },
  };

  const rawTotal =
    breakdown.visualLabels.weightedScore +
    breakdown.category.weightedScore +
    breakdown.color.weightedScore +
    breakdown.location.weightedScore +
    breakdown.temporal.weightedScore +
    breakdown.textSimilarity.weightedScore;

  // Normalized score between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, Math.round(rawTotal * 10) / 10));

  let strength: MatchStrength = "weak";
  if (normalizedScore >= DEFAULT_THRESHOLDS.strong) {
    strength = "strong";
  } else if (normalizedScore >= DEFAULT_THRESHOLDS.possible) {
    strength = "possible";
  }

  return {
    score: normalizedScore,
    strength,
    breakdown,
  };
}

/**
 * Generate a complete MatchCandidate record between two listings
 */
export function generateCandidateMatch(
  lost: Listing,
  found: Listing,
  existingStatus: "candidate" | "reviewing" | "confirmed" | "dismissed" = "candidate"
): MatchCandidate | null {
  const result = calculateMatchScore(lost, found);
  if (!result) return null;

  const explanationData = generateMatchExplanation(
    lost,
    found,
    result.score,
    result.strength,
    result.breakdown
  );

  return {
    id: `match_${lost.id}_${found.id}`,
    lostListingId: lost.id,
    foundListingId: found.id,
    lostListing: lost,
    foundListing: found,
    score: result.score,
    strength: result.strength,
    status: existingStatus,
    explanation: {
      summary: explanationData.summary,
      strength: result.strength,
      matchingClues: explanationData.matchingClues,
      conflictingEvidence: explanationData.conflictingEvidence,
      breakdown: result.breakdown,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Given a target listing and a set of candidate listings, finds and ranks all matches.
 */
export function findMatchesForListing(
  target: Listing,
  allListings: Listing[]
): MatchCandidate[] {
  const candidates: MatchCandidate[] = [];

  for (const other of allListings) {
    if (other.id === target.id) continue;

    let candidate: MatchCandidate | null = null;
    if (target.type === "lost" && other.type === "found") {
      candidate = generateCandidateMatch(target, other);
    } else if (target.type === "found" && other.type === "lost") {
      candidate = generateCandidateMatch(other, target);
    }

    if (candidate && candidate.score >= DEFAULT_THRESHOLDS.minimumDisplay) {
      candidates.push(candidate);
    }
  }

  // Sort descending by score
  return candidates.sort((a, b) => b.score - a.score);
}
