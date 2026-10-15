export type ListingType = "lost" | "found";

export type ItemCategory =
  | "Bags & Backpacks"
  | "Water Bottles & Drinkware"
  | "Earbuds & Headphones"
  | "Electronics & Laptops"
  | "Books & Notebooks"
  | "Keys & Keychains"
  | "Umbrellas & Rainwear"
  | "Chargers & Cables"
  | "Sports & Fitness"
  | "Jewelry & Watches"
  | "Wallets & Cards"
  | "Eyewear & Glasses"
  | "Clothing & Jackets"
  | "Other";

export type ListingStatus = "active" | "in_claim" | "resolved" | "closed";

export interface DetectedLabel {
  name: string;
  confidence: number;
  parents?: string[];
  isSimulated?: boolean;
}

export interface Listing {
  id: string;
  type: ListingType;
  title: string;
  category: ItemCategory;
  description: string;
  imageUrl: string;
  thumbnailUrl?: string;
  s3Key?: string;
  s3Bucket?: string;
  color: string;
  brand?: string;
  date: string; // ISO date string YYYY-MM-DD
  time?: string;
  location: string; // e.g. "North Library 2nd Floor", "Student Union Hall"
  campusZone: string; // e.g. "Library Quad", "Science Complex", "Student Center", "Athletics", "North Campus"
  distinguishingFeatures?: string;
  secretVerificationClue?: string; // Private clue (e.g. sticker on laptop, serial number ending, charm name)
  status: ListingStatus;
  reporterId: string;
  reporterName: string;
  reporterEmail?: string;
  detectedLabels: DetectedLabel[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
