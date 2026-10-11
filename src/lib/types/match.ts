import { Listing } from "./listing";

export type MatchStrength = "strong" | "possible" | "weak";
export type MatchStatus = "candidate" | "reviewing" | "confirmed" | "dismissed";

export interface ScoreComponentBreakdown {
  visualLabels: {
    score: number; // 0-100
    weightedScore: number;
    weight: number; // e.g. 0.35
    overlappingLabels: string[];
  };
  category: {
    score: number;
    weightedScore: number;
    weight: number; // e.g. 0.20
    isMatch: boolean;
  };
  color: {
    score: number;
    weightedScore: number;
    weight: number; // e.g. 0.15
    lostColor: string;
    foundColor: string;
    status: "exact" | "compatible" | "mismatch" | "unknown";
  };
  location: {
    score: number;
    weightedScore: number;
    weight: number; // e.g. 0.15
    zoneMatch: boolean;
    proximityLevel: "same_building" | "same_zone" | "nearby" | "different_zone" | "unknown";
  };
  temporal: {
    score: number;
    weightedScore: number;
    weight: number; // e.g. 0.10
    daysDifference: number;
    orderValid: boolean; // found date >= lost date or within small margin
  };
  textSimilarity: {
    score: number;
    weightedScore: number;
    weight: number; // e.g. 0.05
    commonKeywords: string[];
  };
}

export interface MatchExplanation {
  summary: string;
  strength: MatchStrength;
  matchingClues: string[];
  conflictingEvidence: string[];
  breakdown: ScoreComponentBreakdown;
}

export interface MatchCandidate {
  id: string;
  lostListingId: string;
  foundListingId: string;
  lostListing?: Listing;
  foundListing?: Listing;
  score: number; // 0 to 100
  strength: MatchStrength;
  status: MatchStatus;
  explanation: MatchExplanation;
  createdAt: string;
  updatedAt: string;
}
