import { describe, it, expect } from "vitest";
import {
  calculateMatchScore,
  generateCandidateMatch,
  findMatchesForListing,
} from "../lib/matching/engine";
import { Listing } from "../lib/types/listing";
import { DEFAULT_WEIGHTS } from "../lib/matching/weights";

const baseLostListing: Listing = {
  id: "lost_test_1",
  type: "lost",
  title: "Black Herschel Backpack",
  category: "Bags & Backpacks",
  description: "Matte black canvas backpack lost in library quad with books.",
  imageUrl: "https://example.com/lost.jpg",
  color: "Black",
  brand: "Herschel",
  date: "2026-10-09",
  location: "North Library 2nd Floor",
  campusZone: "Library Quad",
  status: "active",
  reporterId: "user_1",
  reporterName: "Student A",
  detectedLabels: [
    { name: "Backpack", confidence: 99.4 },
    { name: "Bag", confidence: 98.2 },
    { name: "Black", confidence: 90.0 },
  ],
  createdAt: "2026-10-09T10:00:00Z",
  updatedAt: "2026-10-09T10:00:00Z",
};

const compatibleFoundListing: Listing = {
  id: "found_test_1",
  type: "found",
  title: "Found Black Herschel Backpack",
  category: "Bags & Backpacks",
  description: "Black canvas backpack turned into library reception.",
  imageUrl: "https://example.com/found.jpg",
  color: "Black",
  brand: "Herschel",
  date: "2026-10-09",
  location: "North Library 2nd Floor Desk",
  campusZone: "Library Quad",
  status: "active",
  reporterId: "user_2",
  reporterName: "Staff B",
  detectedLabels: [
    { name: "Backpack", confidence: 99.5 },
    { name: "Bag", confidence: 97.0 },
  ],
  createdAt: "2026-10-09T14:00:00Z",
  updatedAt: "2026-10-09T14:00:00Z",
};

describe("Matching Engine", () => {
  it("scores highly (>80) on highly compatible lost and found reports", () => {
    const result = calculateMatchScore(baseLostListing, compatibleFoundListing);
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.strength).toBe("strong");
    expect(result.breakdown.category.isMatch).toBe(true);
    expect(result.breakdown.color.status).toBe("exact");
    expect(result.breakdown.visualLabels.overlappingLabels).toContain("Backpack");
    expect(result.breakdown.temporal.daysDifference).toBe(0);
  });

  it("penalizes color mismatch (e.g. Black vs Red)", () => {
    const redFoundListing: Listing = {
      ...compatibleFoundListing,
      id: "found_red_1",
      color: "Red",
    };

    const result = calculateMatchScore(baseLostListing, redFoundListing);
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.breakdown.color.status).toBe("mismatch");
    expect(result.breakdown.color.score).toBe(0);
    expect(result.score).toBeLessThanOrEqual(85);
  });

  it("penalizes category mismatch (e.g. Bags vs Electronics)", () => {
    const electronicsFoundListing: Listing = {
      ...compatibleFoundListing,
      id: "found_elec_1",
      category: "Electronics & Laptops",
      title: "Found MacBook Laptop",
    };

    const result = calculateMatchScore(baseLostListing, electronicsFoundListing);
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.breakdown.category.isMatch).toBe(false);
    expect(result.breakdown.category.score).toBe(0);
  });

  it("does not award maximum score to missing attributes", () => {
    const noColorListing: Listing = {
      ...baseLostListing,
      id: "lost_no_color",
      color: "",
      detectedLabels: [],
    };

    const result = calculateMatchScore(noColorListing, compatibleFoundListing);
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.breakdown.color.status).toBe("unknown");
    expect(result.breakdown.color.score).toBe(30); // Not 100
  });

  it("identifies chronological anomaly when found date is prior to lost date", () => {
    const anomalyListing: Listing = {
      ...compatibleFoundListing,
      id: "found_anomaly",
      date: "2026-09-01", // 38 days before lost date
    };

    const result = calculateMatchScore(baseLostListing, anomalyListing);
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.breakdown.temporal.orderValid).toBe(false);
    expect(result.breakdown.temporal.score).toBeLessThanOrEqual(10);
  });

  it("refuses to compare a listing with itself", () => {
    const result = calculateMatchScore(baseLostListing, {
      ...baseLostListing,
      type: "found" as any,
      id: baseLostListing.id,
    });
    expect(result).toBeNull();
  });

  it("refuses to compare lost-with-lost or found-with-found", () => {
    const anotherLost: Listing = {
      ...baseLostListing,
      id: "lost_another",
    };
    const result = calculateMatchScore(baseLostListing, anotherLost);
    expect(result).toBeNull();
  });

  it("generates detailed explanation with matching clues and conflicting evidence", () => {
    const candidate = generateCandidateMatch(baseLostListing, compatibleFoundListing);
    expect(candidate).not.toBeNull();
    if (!candidate) return;

    expect(candidate.explanation.summary).toContain("compatibility");
    expect(candidate.explanation.matchingClues.length).toBeGreaterThan(0);
    expect(candidate.score).toBeGreaterThanOrEqual(0);
    expect(candidate.score).toBeLessThanOrEqual(100);
  });

  it("ranks candidate listings in descending order of score", () => {
    const listings: Listing[] = [
      compatibleFoundListing,
      {
        ...compatibleFoundListing,
        id: "found_unrelated",
        category: "Jewelry & Watches",
        title: "Silver Ring",
        color: "Silver",
        campusZone: "Athletics",
        detectedLabels: [{ name: "Ring", confidence: 95 }],
      },
    ];

    const matches = findMatchesForListing(baseLostListing, listings);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].score).toBeGreaterThanOrEqual(matches[matches.length - 1].score);
  });
});
