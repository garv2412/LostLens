export type ClaimStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface Claim {
  id: string;
  listingId: string; // The found listing being claimed
  matchId?: string; // Optional match record reference
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  distinguishingDetails: string; // Private evidence submitted by claimant
  additionalProof?: string;
  status: ClaimStatus;
  decisionNote?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}
