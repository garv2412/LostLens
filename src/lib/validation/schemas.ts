import { z } from "zod";

export const ItemCategoryEnum = z.enum([
  "Bags & Backpacks",
  "Water Bottles & Drinkware",
  "Earbuds & Headphones",
  "Electronics & Laptops",
  "Books & Notebooks",
  "Keys & Keychains",
  "Umbrellas & Rainwear",
  "Chargers & Cables",
  "Sports & Fitness",
  "Jewelry & Watches",
  "Wallets & Cards",
  "Eyewear & Glasses",
  "Clothing & Jackets",
  "Other",
]);

export const ListingTypeEnum = z.enum(["lost", "found"]);

export const CreateListingSchema = z.object({
  type: ListingTypeEnum,
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  category: ItemCategoryEnum,
  description: z
    .string()
    .min(10, "Please provide a description with at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  imageUrl: z.string().min(1, "A photograph or image preview is required"),
  color: z.string().min(2, "Please specify a color (e.g. Black, Blue, Silver)"),
  brand: z.string().max(50).optional().or(z.literal("")),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date in YYYY-MM-DD format"),
  time: z.string().optional().or(z.literal("")),
  location: z
    .string()
    .min(3, "Location must be at least 3 characters (e.g. Library 2nd Floor)"),
  campusZone: z.string().min(2, "Please select or provide a campus zone"),
  distinguishingFeatures: z.string().max(300).optional().or(z.literal("")),
  secretVerificationClue: z.string().max(300).optional().or(z.literal("")),
  reporterName: z.string().min(2, "Reporter name is required"),
  reporterEmail: z.string().email("Please provide a valid email address").optional().or(z.literal("")),
});

export const CreateClaimSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  matchId: z.string().optional(),
  distinguishingDetails: z
    .string()
    .min(15, "Please provide detailed ownership proof (at least 15 characters)"),
  additionalProof: z.string().max(500).optional().or(z.literal("")),
  claimantName: z.string().min(2, "Claimant name is required"),
  claimantEmail: z.string().email("Valid email is required"),
});

export const ClaimDecisionSchema = z.object({
  claimId: z.string().min(1, "Claim ID is required"),
  decision: z.enum(["accept", "reject"]),
  decisionNote: z.string().max(300).optional(),
});

export const PresignedUrlRequestSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  contentType: z
    .string()
    .regex(/^image\/(jpeg|png|webp|gif)$/, "Only JPEG, PNG, WEBP, and GIF images are allowed"),
  fileSize: z
    .number()
    .max(10 * 1024 * 1024, "Image file size must be less than 10MB"),
});

export type CreateListingInput = z.infer<typeof CreateListingSchema>;
export type CreateClaimInput = z.infer<typeof CreateClaimSchema>;
export type ClaimDecisionInput = z.infer<typeof ClaimDecisionSchema>;
export type PresignedUrlRequestInput = z.infer<typeof PresignedUrlRequestSchema>;
