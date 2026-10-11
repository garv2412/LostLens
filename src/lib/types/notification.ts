export type NotificationType =
  | "match_found"
  | "claim_received"
  | "claim_accepted"
  | "claim_rejected"
  | "item_recovered"
  | "system_alert";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    listingId?: string;
    matchId?: string;
    claimId?: string;
    score?: number;
  };
}
