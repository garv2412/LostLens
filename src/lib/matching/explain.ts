import { MatchStrength, ScoreComponentBreakdown } from "../types/match";
import { Listing } from "../types/listing";

export function generateMatchExplanation(
  lost: Listing,
  found: Listing,
  totalScore: number,
  strength: MatchStrength,
  breakdown: ScoreComponentBreakdown
): {
  summary: string;
  matchingClues: string[];
  conflictingEvidence: string[];
} {
  const matchingClues: string[] = [];
  const conflictingEvidence: string[] = [];

  // 1. Visual labels
  if (breakdown.visualLabels.overlappingLabels.length > 0) {
    matchingClues.push(
      `Detected visual tags align: ${breakdown.visualLabels.overlappingLabels.slice(0, 4).join(", ")}`
    );
  } else if (lost.detectedLabels.length > 0 && found.detectedLabels.length > 0) {
    conflictingEvidence.push("No overlapping visual labels detected in item photographs");
  } else {
    conflictingEvidence.push("Visual label confidence is limited or labels are unavailable for one item");
  }

  // 2. Category
  if (breakdown.category.isMatch) {
    matchingClues.push(`Identical category classification: "${lost.category}"`);
  } else {
    conflictingEvidence.push(
      `Category mismatch: reported as "${lost.category}" vs found as "${found.category}"`
    );
  }

  // 3. Color
  if (breakdown.color.status === "exact") {
    matchingClues.push(`Matching primary color: "${lost.color}"`);
  } else if (breakdown.color.status === "compatible") {
    matchingClues.push(
      `Compatible color tones: "${lost.color}" and "${found.color}"`
    );
  } else if (breakdown.color.status === "mismatch") {
    conflictingEvidence.push(
      `Different reported colors: "${lost.color}" (lost) vs "${found.color}" (found)`
    );
  } else {
    conflictingEvidence.push("One or both reports did not specify a primary color");
  }

  // 4. Location
  if (breakdown.location.proximityLevel === "same_building") {
    matchingClues.push(`Same specific building/area: "${found.location}"`);
  } else if (breakdown.location.proximityLevel === "same_zone") {
    matchingClues.push(`Within the same campus zone: "${lost.campusZone}"`);
  } else if (breakdown.location.proximityLevel === "nearby") {
    matchingClues.push(`Adjacent campus sectors: "${lost.campusZone}" and "${found.campusZone}"`);
  } else if (breakdown.location.proximityLevel === "different_zone") {
    conflictingEvidence.push(
      `Distinct campus zones: lost at "${lost.campusZone}", found at "${found.campusZone}"`
    );
  }

  // 5. Temporal
  const daysDiff = breakdown.temporal.daysDifference;
  if (!breakdown.temporal.orderValid) {
    conflictingEvidence.push(
      `Chronological anomaly: item was reported found ${Math.abs(daysDiff)} days before the reported loss date`
    );
  } else if (daysDiff === 0) {
    matchingClues.push("Same-day discovery: found on the exact same date as the reported loss");
  } else if (daysDiff <= 3) {
    matchingClues.push(`Tight timeline: found within ${daysDiff} day${daysDiff > 1 ? "s" : ""} of loss`);
  } else if (daysDiff <= 14) {
    matchingClues.push(`Plausible timeline: found ${daysDiff} days after loss`);
  } else {
    conflictingEvidence.push(`Long elapsed timeframe: found ${daysDiff} days after loss`);
  }

  // 6. Brand & text
  if (lost.brand && found.brand) {
    if (lost.brand.toLowerCase().trim() === found.brand.toLowerCase().trim()) {
      matchingClues.push(`Confirmed matching brand: "${lost.brand}"`);
    } else {
      conflictingEvidence.push(
        `Brand discrepancy: reported as "${lost.brand}" vs found as "${found.brand}"`
      );
    }
  } else if (lost.brand && !found.brand) {
    conflictingEvidence.push(`Lost report specifies brand "${lost.brand}", but found item brand is unconfirmed`);
  }

  if (breakdown.textSimilarity.commonKeywords.length > 0) {
    matchingClues.push(
      `Key descriptive keywords overlap: ${breakdown.textSimilarity.commonKeywords.slice(0, 3).join(", ")}`
    );
  }

  // Summary sentence synthesis
  let summary = "";
  if (strength === "strong") {
    summary = `Strong candidate (${Math.round(totalScore)}% compatibility): both reports indicate a ${lost.color || "similar"} ${lost.category.toLowerCase()}`;
    if (breakdown.visualLabels.overlappingLabels.length > 0) {
      summary += ` with verified visual label overlap (${breakdown.visualLabels.overlappingLabels.slice(0, 2).join(", ")})`;
    }
    if (breakdown.location.zoneMatch) {
      summary += ` in the ${lost.campusZone} zone`;
    }
    if (breakdown.temporal.orderValid && daysDiff <= 3) {
      summary += `. The found date is within ${daysDiff === 0 ? "hours" : daysDiff + " day(s)"} of the loss`;
    }
    summary += ".";
    if (conflictingEvidence.length > 0) {
      summary += ` Note: ${conflictingEvidence[0]}.`;
    }
  } else if (strength === "possible") {
    summary = `Possible candidate (${Math.round(totalScore)}% compatibility): shares category (${lost.category})`;
    if (breakdown.color.status === "exact" || breakdown.color.status === "compatible") {
      summary += ` and color characteristics`;
    }
    if (conflictingEvidence.length > 0) {
      summary += `, but exhibits differences: ${conflictingEvidence[0].toLowerCase()}`;
    }
    summary += ". Requires claimant verification.";
  } else {
    summary = `Low compatibility candidate (${Math.round(totalScore)}% match): significant discrepancies in ${
      conflictingEvidence.slice(0, 2).join(" and ") || "item attributes"
    }.`;
  }

  return {
    summary,
    matchingClues,
    conflictingEvidence,
  };
}
