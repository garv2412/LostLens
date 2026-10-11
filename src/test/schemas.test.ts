import { describe, it, expect } from "vitest";
import {
  CreateListingSchema,
  CreateClaimSchema,
  PresignedUrlRequestSchema,
} from "../lib/validation/schemas";

describe("Validation Schemas", () => {
  it("validates valid listing input", () => {
    const input = {
      type: "lost",
      title: "Blue Herschel Backpack",
      category: "Bags & Backpacks",
      description: "Lost in the library first floor around 2pm.",
      imageUrl: "https://example.com/bag.jpg",
      color: "Blue",
      date: "2026-10-10",
      location: "Library First Floor",
      campusZone: "Library Quad",
      reporterName: "Maya Lin",
    };

    const result = CreateListingSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("fails on invalid listing date format", () => {
    const input = {
      type: "lost",
      title: "Blue Herschel Backpack",
      category: "Bags & Backpacks",
      description: "Lost in the library first floor around 2pm.",
      imageUrl: "https://example.com/bag.jpg",
      color: "Blue",
      date: "10/10/2026", // Invalid format
      location: "Library First Floor",
      campusZone: "Library Quad",
      reporterName: "Maya Lin",
    };

    const result = CreateListingSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("fails on insufficient claim details", () => {
    const input = {
      listingId: "lst_123",
      distinguishingDetails: "mine", // too short
      claimantName: "Maya",
      claimantEmail: "maya@campus.edu",
    };

    const result = CreateClaimSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("validates image upload file types and rejects unauthorized extensions", () => {
    const valid = PresignedUrlRequestSchema.safeParse({
      fileName: "photo.jpg",
      contentType: "image/jpeg",
      fileSize: 1024 * 500,
    });
    expect(valid.success).toBe(true);

    const invalidType = PresignedUrlRequestSchema.safeParse({
      fileName: "script.sh",
      contentType: "application/x-sh",
      fileSize: 1024,
    });
    expect(invalidType.success).toBe(false);
  });
});
