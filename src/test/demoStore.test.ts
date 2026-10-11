import { describe, it, expect, beforeEach } from "vitest";
import { DemoStore } from "../lib/demo/store";

describe("DemoStore and State Management", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("loads seeded listings initially", () => {
    const listings = DemoStore.getListings();
    expect(listings.length).toBeGreaterThanOrEqual(10);
    expect(listings[0]).toHaveProperty("id");
    expect(listings[0]).toHaveProperty("title");
  });

  it("persists a newly created listing", () => {
    const newListing = DemoStore.createListing({
      type: "lost",
      title: "Test Hydro Flask Lost",
      category: "Water Bottles & Drinkware",
      description: "Left in chemistry lab near workstation 4.",
      imageUrl: "https://example.com/flask.jpg",
      color: "Blue",
      date: "2026-10-10",
      location: "Chemistry Lab 301",
      campusZone: "Science Complex",
      status: "active",
      reporterId: "user_test",
      reporterName: "Test User",
      detectedLabels: [{ name: "Bottle", confidence: 98 }],
    });

    expect(newListing.id).toBeDefined();
    const fetched = DemoStore.getListingById(newListing.id);
    expect(fetched).toBeDefined();
    expect(fetched?.title).toBe("Test Hydro Flask Lost");
  });

  it("handles claim creation and status transition to resolved", () => {
    const listings = DemoStore.getListings();
    const targetListing = listings[0];

    const claim = DemoStore.createClaim(
      targetListing.id,
      "I have the matching serial number and purchase receipt.",
      "Photo of box attached"
    );

    expect(claim.status).toBe("pending");
    expect(claim.listingId).toBe(targetListing.id);

    // Accept the claim
    const updated = DemoStore.updateClaimStatus(claim.id, "accepted", "Proof checked.");
    expect(updated?.status).toBe("accepted");

    // The listing status should now transition to resolved
    const listingAfter = DemoStore.getListingById(targetListing.id);
    expect(listingAfter?.status).toBe("resolved");
  });

  it("allows resetting demo data back to clean initial state", () => {
    DemoStore.createListing({
      type: "found",
      title: "Temporary Scratch Item",
      category: "Other",
      description: "Temporary item description.",
      imageUrl: "https://example.com/temp.jpg",
      color: "Black",
      date: "2026-10-10",
      location: "Test Location",
      campusZone: "Library Quad",
      status: "active",
      reporterId: "temp",
      reporterName: "Temp",
      detectedLabels: [],
    });

    DemoStore.resetDemoData();
    const listings = DemoStore.getListings();
    const scratch = listings.find((l) => l.title === "Temporary Scratch Item");
    expect(scratch).toBeUndefined();
  });
});
