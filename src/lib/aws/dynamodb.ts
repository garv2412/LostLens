import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { getDynamoDocClient, isLiveMode } from "./config";
import { Listing, ListingStatus } from "../types/listing";
import { Claim, ClaimStatus } from "../types/claim";
import { AppNotification } from "../types/notification";
import { DemoStore } from "../demo/store";
import { CURRENT_DEMO_USER } from "../demo/seedData";

const TABLES = {
  LISTINGS: process.env.DYNAMODB_TABLE_LISTINGS || "LostLens_Listings",
  MATCHES: process.env.DYNAMODB_TABLE_MATCHES || "LostLens_Matches",
  CLAIMS: process.env.DYNAMODB_TABLE_CLAIMS || "LostLens_Claims",
  NOTIFICATIONS: process.env.DYNAMODB_TABLE_NOTIFICATIONS || "LostLens_Notifications",
};

export class DynamoDbService {
  // --- LISTINGS ---

  public static async getListings(): Promise<Listing[]> {
    if (!isLiveMode()) {
      return DemoStore.getListings();
    }

    try {
      const client = getDynamoDocClient();
      const command = new ScanCommand({
        TableName: TABLES.LISTINGS,
        Limit: 100,
      });
      const response = await client.send(command);
      return (response.Items as Listing[]) || [];
    } catch {
      return DemoStore.getListings();
    }
  }

  public static async getListingById(id: string): Promise<Listing | undefined> {
    if (!isLiveMode()) {
      return DemoStore.getListingById(id);
    }

    try {
      const client = getDynamoDocClient();
      const command = new GetCommand({
        TableName: TABLES.LISTINGS,
        Key: { id },
      });
      const response = await client.send(command);
      return response.Item as Listing | undefined;
    } catch {
      return DemoStore.getListingById(id);
    }
  }

  public static async createListing(
    listingData: Omit<Listing, "id" | "createdAt" | "updatedAt">
  ): Promise<Listing> {
    if (!isLiveMode()) {
      return DemoStore.createListing(listingData);
    }

    try {
      const client = getDynamoDocClient();
      const id = `lst_${listingData.type}_${Date.now()}`;
      const timestamp = new Date().toISOString();
      const item: Listing = {
        ...listingData,
        id,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await client.send(
        new PutCommand({
          TableName: TABLES.LISTINGS,
          Item: item,
        })
      );
      return item;
    } catch {
      return DemoStore.createListing(listingData);
    }
  }

  public static async updateListingStatus(
    id: string,
    status: ListingStatus
  ): Promise<Listing | null> {
    if (!isLiveMode()) {
      return DemoStore.updateListingStatus(id, status);
    }

    try {
      const client = getDynamoDocClient();
      const timestamp = new Date().toISOString();
      const command = new UpdateCommand({
        TableName: TABLES.LISTINGS,
        Key: { id },
        UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":status": status,
          ":updatedAt": timestamp,
        },
        ReturnValues: "ALL_NEW",
      });
      const response = await client.send(command);
      return response.Attributes as Listing;
    } catch {
      return DemoStore.updateListingStatus(id, status);
    }
  }

  public static async deleteListing(id: string): Promise<boolean> {
    if (!isLiveMode()) {
      return DemoStore.deleteListing(id);
    }

    try {
      const client = getDynamoDocClient();
      await client.send(
        new DeleteCommand({
          TableName: TABLES.LISTINGS,
          Key: { id },
        })
      );
      DemoStore.deleteListing(id);
      return true;
    } catch {
      return DemoStore.deleteListing(id);
    }
  }

  // --- CLAIMS ---

  public static async getClaims(): Promise<Claim[]> {
    if (!isLiveMode()) {
      return DemoStore.getClaims();
    }

    try {
      const client = getDynamoDocClient();
      const command = new ScanCommand({
        TableName: TABLES.CLAIMS,
        Limit: 100,
      });
      const response = await client.send(command);
      return (response.Items as Claim[]) || [];
    } catch {
      return DemoStore.getClaims();
    }
  }

  public static async createClaim(
    listingId: string,
    distinguishingDetails: string,
    additionalProof?: string,
    matchId?: string,
    claimantName?: string,
    claimantEmail?: string
  ): Promise<Claim> {
    if (!isLiveMode()) {
      return DemoStore.createClaim(listingId, distinguishingDetails, additionalProof, matchId);
    }

    try {
      const client = getDynamoDocClient();
      const id = `clm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const timestamp = new Date().toISOString();
      const item: Claim = {
        id,
        listingId,
        matchId,
        claimantId: CURRENT_DEMO_USER.id,
        claimantName: claimantName || CURRENT_DEMO_USER.name,
        claimantEmail: claimantEmail || CURRENT_DEMO_USER.email,
        distinguishingDetails,
        additionalProof,
        status: "pending",
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await client.send(
        new PutCommand({
          TableName: TABLES.CLAIMS,
          Item: item,
        })
      );
      DemoStore.saveClaim(item);
      return item;
    } catch {
      return DemoStore.createClaim(listingId, distinguishingDetails, additionalProof, matchId);
    }
  }

  public static async updateClaimStatus(
    claimId: string,
    status: ClaimStatus,
    decisionNote?: string
  ): Promise<Claim | null> {
    if (!isLiveMode()) {
      return DemoStore.updateClaimStatus(claimId, status, decisionNote);
    }

    try {
      const client = getDynamoDocClient();
      const timestamp = new Date().toISOString();
      const command = new UpdateCommand({
        TableName: TABLES.CLAIMS,
        Key: { id: claimId },
        UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt, #decisionNote = :decisionNote",
        ExpressionAttributeNames: {
          "#status": "status",
          "#updatedAt": "updatedAt",
          "#decisionNote": "decisionNote",
        },
        ExpressionAttributeValues: {
          ":status": status,
          ":updatedAt": timestamp,
          ":decisionNote": decisionNote || null,
        },
        ReturnValues: "ALL_NEW",
      });
      const response = await client.send(command);
      DemoStore.updateClaimStatus(claimId, status, decisionNote);
      return response.Attributes as Claim;
    } catch {
      return DemoStore.updateClaimStatus(claimId, status, decisionNote);
    }
  }
}
