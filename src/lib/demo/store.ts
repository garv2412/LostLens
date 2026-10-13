import { Listing, ListingStatus } from "../types/listing";
import { Claim, ClaimStatus } from "../types/claim";
import { AppNotification } from "../types/notification";
import { MatchCandidate, MatchStatus } from "../types/match";
import { SystemStats } from "../types/user";
import {
  INITIAL_LISTINGS,
  INITIAL_CLAIMS,
  INITIAL_NOTIFICATIONS,
  CURRENT_DEMO_USER,
} from "./seedData";
import { findMatchesForListing, generateCandidateMatch } from "../matching/engine";

const STORAGE_KEYS = {
  LISTINGS: "lostlens_demo_listings_v1",
  CLAIMS: "lostlens_demo_claims_v1",
  NOTIFICATIONS: "lostlens_demo_notifications_v1",
  MATCH_OVERRIDES: "lostlens_demo_match_status_v1",
};

export class DemoStore {
  private static serverListings: Listing[] = [...INITIAL_LISTINGS];
  private static serverClaims: Claim[] = [...INITIAL_CLAIMS];
  private static serverNotifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];

  private static isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  // --- LISTINGS ---

  public static getListings(): Listing[] {
    let list: Listing[];
    if (!this.isBrowser()) {
      list = [...this.serverListings];
    } else {
      const raw = localStorage.getItem(STORAGE_KEYS.LISTINGS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(INITIAL_LISTINGS));
        list = [...INITIAL_LISTINGS];
      } else {
        try {
          list = JSON.parse(raw);
        } catch {
          list = [...INITIAL_LISTINGS];
        }
      }
    }

    // Auto-heal any mismatched labels in case user previously filed with default category
    let mutated = false;
    list = list.map((l) => {
      if (l.title.toLowerCase().includes("sunglass") && l.detectedLabels.some((lbl) => lbl.name === "Backpack")) {
        mutated = true;
        return {
          ...l,
          category: "Eyewear & Glasses",
          detectedLabels: [
            { name: "Sunglasses", confidence: 99.5, isSimulated: true },
            { name: "Glasses", confidence: 96.8, isSimulated: true },
            { name: "Eyewear", confidence: 93.9, isSimulated: true },
            { name: "Optical Instrument", confidence: 91.0, isSimulated: true },
            { name: l.color ? (l.color.charAt(0).toUpperCase() + l.color.slice(1)) : "Black", confidence: 88.5, isSimulated: true },
          ],
        };
      }
      return l;
    });

    if (mutated && this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(list));
    }

    return list;
  }

  public static getListingById(id: string): Listing | undefined {
    const all = this.getListings();
    return all.find((l) => l.id === id);
  }

  public static saveListing(listing: Listing): void {
    const all = this.getListings();
    const idx = all.findIndex((l) => l.id === listing.id);
    let updated: Listing[];
    if (idx >= 0) {
      all[idx] = listing;
      updated = [...all];
    } else {
      updated = [listing, ...all];
    }

    this.serverListings = updated;
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updated));
    }

    this.processNewListingMatches(listing);
  }

  public static createListing(data: Omit<Listing, "id" | "createdAt" | "updatedAt">): Listing {
    const all = this.getListings();
    const newId = `lst_${data.type}_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newListing: Listing = {
      ...data,
      id: newId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updated = [newListing, ...all];
    this.serverListings = updated;
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(updated));
    }

    // Automatically trigger match check and create notification if matches found
    this.processNewListingMatches(newListing);

    return newListing;
  }

  public static updateListingStatus(id: string, status: ListingStatus): Listing | null {
    const all = this.getListings();
    const idx = all.findIndex((l) => l.id === id);
    if (idx === -1) return null;

    all[idx] = {
      ...all[idx],
      status,
      updatedAt: new Date().toISOString(),
    };

    this.serverListings = all;
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(all));
    }
    return all[idx];
  }

  public static deleteListing(id: string): boolean {
    const all = this.getListings();
    const filtered = all.filter((l) => l.id !== id);
    if (filtered.length === all.length) return false;

    this.serverListings = filtered;
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(filtered));

      // Also clean up any claims filed for this listing
      const allClaims = this.getClaims();
      const filteredClaims = allClaims.filter((c) => c.listingId !== id);
      this.serverClaims = filteredClaims;
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(filteredClaims));
    }
    return true;
  }

  // --- MATCHES ---

  private static getMatchStatusOverrides(): Record<string, MatchStatus> {
    if (!this.isBrowser()) return {};
    const raw = localStorage.getItem(STORAGE_KEYS.MATCH_OVERRIDES);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  public static getAllMatches(): MatchCandidate[] {
    const listings = this.getListings();
    const overrides = this.getMatchStatusOverrides();

    const lostListings = listings.filter((l) => l.type === "lost");
    const foundListings = listings.filter((l) => l.type === "found");

    const allCandidates: MatchCandidate[] = [];

    for (const lost of lostListings) {
      for (const found of foundListings) {
        const candidate = generateCandidateMatch(lost, found);
        if (candidate) {
          if (overrides[candidate.id]) {
            candidate.status = overrides[candidate.id];
          }
          allCandidates.push(candidate);
        }
      }
    }

    // Sort descending by score
    return allCandidates.sort((a, b) => b.score - a.score);
  }

  public static updateMatchStatus(matchId: string, status: MatchStatus): void {
    if (!this.isBrowser()) return;
    const overrides = this.getMatchStatusOverrides();
    overrides[matchId] = status;
    localStorage.setItem(STORAGE_KEYS.MATCH_OVERRIDES, JSON.stringify(overrides));
  }

  // --- CLAIMS ---

  public static getClaims(): Claim[] {
    if (!this.isBrowser()) {
      return [...this.serverClaims];
    }
    const raw = localStorage.getItem(STORAGE_KEYS.CLAIMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(INITIAL_CLAIMS));
      return [...INITIAL_CLAIMS];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [...INITIAL_CLAIMS];
    }
  }

  public static getClaimsForListing(listingId: string): Claim[] {
    return this.getClaims().filter((c) => c.listingId === listingId);
  }

  public static saveClaim(claim: Claim): void {
    const all = this.getClaims();
    const idx = all.findIndex((c) => c.id === claim.id);
    let updated: Claim[];
    if (idx >= 0) {
      all[idx] = claim;
      updated = [...all];
    } else {
      updated = [claim, ...all];
    }

    this.serverClaims = updated;
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updated));
    }
  }

  public static createClaim(
    listingId: string,
    distinguishingDetails: string,
    additionalProof?: string,
    matchId?: string
  ): Claim {
    const all = this.getClaims();
    const targetListing = this.getListingById(listingId);

    const newClaim: Claim = {
      id: `clm_${Date.now()}`,
      listingId,
      matchId,
      claimantId: CURRENT_DEMO_USER.id,
      claimantName: CURRENT_DEMO_USER.name,
      claimantEmail: CURRENT_DEMO_USER.email,
      distinguishingDetails,
      additionalProof,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newClaim, ...all];
    this.serverClaims = updated;
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updated));
    }

    // Update listing status to in_claim
    this.updateListingStatus(listingId, "in_claim");

    // Create in-app notification for the listing owner
    if (targetListing) {
      this.createNotification({
        userId: targetListing.reporterId,
        type: "claim_received",
        title: "New Ownership Claim Submitted",
        message: `${CURRENT_DEMO_USER.name} submitted a claim with verification proof for '${targetListing.title}'.`,
        linkUrl: `/listings/${listingId}`,
        isRead: false,
        metadata: {
          listingId,
          claimId: newClaim.id,
        },
      });
    }

    return newClaim;
  }

  public static updateClaimStatus(claimId: string, status: ClaimStatus, decisionNote?: string): Claim | null {
    const all = this.getClaims();
    const idx = all.findIndex((c) => c.id === claimId);
    if (idx === -1) return null;

    const timestamp = new Date().toISOString();
    all[idx] = {
      ...all[idx],
      status,
      decisionNote,
      updatedAt: timestamp,
      resolvedAt: status === "accepted" || status === "rejected" ? timestamp : undefined,
    };

    this.serverClaims = all;
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(all));
    }

    const claim = all[idx];
    const listing = this.getListingById(claim.listingId);

    if (status === "accepted") {
      // Mark listing as resolved / recovered
      this.updateListingStatus(claim.listingId, "resolved");

      // Notify claimant
      this.createNotification({
        userId: claim.claimantId,
        type: "claim_accepted",
        title: "Ownership Claim Approved!",
        message: `Your claim for '${listing?.title || "item"}' has been accepted. Coordinate pickup or delivery.`,
        linkUrl: `/listings/${claim.listingId}`,
        isRead: false,
        metadata: {
          listingId: claim.listingId,
          claimId: claim.id,
        },
      });
    } else if (status === "rejected") {
      // Reset listing to active if no other pending claims
      const remainingClaims = all.filter((c) => c.listingId === claim.listingId && c.status === "pending");
      if (remainingClaims.length === 0) {
        this.updateListingStatus(claim.listingId, "active");
      }

      this.createNotification({
        userId: claim.claimantId,
        type: "claim_rejected",
        title: "Ownership Claim Decision",
        message: `Your claim for '${listing?.title || "item"}' could not be verified by the reporter.`,
        linkUrl: `/listings/${claim.listingId}`,
        isRead: false,
        metadata: {
          listingId: claim.listingId,
          claimId: claim.id,
        },
      });
    }

    return all[idx];
  }

  // --- NOTIFICATIONS ---

  public static getNotifications(userId: string = CURRENT_DEMO_USER.id): AppNotification[] {
    if (!this.isBrowser()) {
      return [...INITIAL_NOTIFICATIONS];
    }
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return [...INITIAL_NOTIFICATIONS];
    }
    try {
      const all: AppNotification[] = JSON.parse(raw);
      return all.filter((n) => !userId || n.userId === userId || n.userId === "all");
    } catch {
      return [...INITIAL_NOTIFICATIONS];
    }
  }

  public static createNotification(data: Omit<AppNotification, "id" | "createdAt">): AppNotification {
    const raw = this.isBrowser() ? localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) : null;
    let all: AppNotification[] = raw ? JSON.parse(raw) : [...INITIAL_NOTIFICATIONS];

    const newNotification: AppNotification = {
      ...data,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    all = [newNotification, ...all];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    }
    return newNotification;
  }

  public static markNotificationRead(id: string): void {
    if (!this.isBrowser()) return;
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return;
    try {
      const all: AppNotification[] = JSON.parse(raw);
      const updated = all.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch {
      // pass
    }
  }

  public static markAllNotificationsRead(userId: string = CURRENT_DEMO_USER.id): void {
    if (!this.isBrowser()) return;
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return;
    try {
      const all: AppNotification[] = JSON.parse(raw);
      const updated = all.map((n) => (n.userId === userId ? { ...n, isRead: true } : n));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch {
      // pass
    }
  }

  // --- MATCH DETECTION NOTIFICATION HOOK ---

  private static processNewListingMatches(newListing: Listing): void {
    const all = this.getListings();
    const potentialMatches = findMatchesForListing(newListing, all);

    if (potentialMatches.length > 0) {
      const best = potentialMatches[0];
      if (best.score >= 50) {
        this.createNotification({
          userId: CURRENT_DEMO_USER.id,
          type: "match_found",
          title: `Match Discovered (${Math.round(best.score)}%)`,
          message: `LostLens identified a potential match for '${newListing.title}'.`,
          linkUrl: "/matches",
          isRead: false,
          metadata: {
            listingId: newListing.id,
            matchId: best.id,
            score: best.score,
          },
        });
      }
    }
  }

  // --- ANALYTICS & SYSTEM STATS ---

  public static getSystemStats(): SystemStats {
    const listings = this.getListings();
    const matches = this.getAllMatches();

    const totalListings = listings.length;
    const lostCount = listings.filter((l) => l.type === "lost").length;
    const foundCount = listings.filter((l) => l.type === "found").length;
    const recoveredCount = listings.filter((l) => l.status === "resolved").length;
    const activeMatches = matches.filter((m) => m.strength !== "weak" && m.status !== "dismissed").length;

    const resolutionRate = totalListings > 0 ? Math.round((recoveredCount / totalListings) * 100) : 0;

    return {
      totalListings,
      lostCount,
      foundCount,
      activeMatches,
      recoveredCount,
      resolutionRate,
      averageRecoveryDays: 1.8,
    };
  }

  // --- RESET DEMO ---

  public static resetDemoData(): void {
    this.serverListings = [...INITIAL_LISTINGS];
    this.serverClaims = [...INITIAL_CLAIMS];
    this.serverNotifications = [...INITIAL_NOTIFICATIONS];
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(INITIAL_LISTINGS));
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(INITIAL_CLAIMS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.removeItem(STORAGE_KEYS.MATCH_OVERRIDES);
  }
}
