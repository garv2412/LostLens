import { NextRequest, NextResponse } from "next/server";
import { CreateListingSchema } from "@/lib/validation/schemas";
import { DynamoDbService } from "@/lib/aws/dynamodb";
import { analyzeItemImage } from "@/lib/aws/rekognition";
import { findMatchesForListing } from "@/lib/matching/engine";
import { CURRENT_DEMO_USER } from "@/lib/demo/seedData";
import { inferCategoryFromText } from "@/lib/demo/simulatedRekognition";
import { Listing } from "@/lib/types/listing";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "lost" | "found"
    const category = searchParams.get("category");
    const color = searchParams.get("color");
    const status = searchParams.get("status");
    const zone = searchParams.get("zone");
    const search = searchParams.get("search")?.toLowerCase().trim();

    let listings = await DynamoDbService.getListings();

    if (type) {
      listings = listings.filter((l) => l.type === type);
    }
    if (category && category !== "All") {
      listings = listings.filter((l) => l.category === category);
    }
    if (color && color !== "All") {
      listings = listings.filter(
        (l) => (l.color || "").toLowerCase() === color.toLowerCase()
      );
    }
    if (status && status !== "All") {
      listings = listings.filter((l) => l.status === status);
    }
    if (zone && zone !== "All") {
      listings = listings.filter((l) => l.campusZone === zone);
    }
    if (search) {
      listings = listings.filter(
        (l) =>
          l.title.toLowerCase().includes(search) ||
          l.description.toLowerCase().includes(search) ||
          l.location.toLowerCase().includes(search) ||
          (l.brand && l.brand.toLowerCase().includes(search)) ||
          l.detectedLabels.some((lbl) => lbl.name.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      data: listings,
      meta: {
        total: listings.length,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch listings";
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateListingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error in listing submission",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // If default category was kept or mismatched with strong title keywords, smartly align category
    let resolvedCategory = input.category;
    const inferred = inferCategoryFromText(input.title);
    if (inferred && (resolvedCategory === "Bags & Backpacks" || resolvedCategory === "Other")) {
      resolvedCategory = inferred;
    }

    // Run Rekognition analysis to extract visual labels
    const analysis = await analyzeItemImage({
      category: resolvedCategory,
      title: input.title,
      color: input.color,
      s3Key: input.s3Key,
      s3Bucket: input.s3Bucket || process.env.AWS_S3_BUCKET_NAME,
    });

    const listingData: Omit<Listing, "id" | "createdAt" | "updatedAt"> = {
      type: input.type,
      title: input.title,
      category: resolvedCategory,
      description: input.description,
      imageUrl: input.imageUrl,
      s3Key: input.s3Key,
      s3Bucket: input.s3Bucket || process.env.AWS_S3_BUCKET_NAME,
      color: input.color,
      brand: input.brand || undefined,
      date: input.date,
      time: input.time || undefined,
      location: input.location,
      campusZone: input.campusZone,
      distinguishingFeatures: input.distinguishingFeatures || undefined,
      secretVerificationClue: input.secretVerificationClue || undefined,
      status: "active",
      reporterId: CURRENT_DEMO_USER.id,
      reporterName: input.reporterName || CURRENT_DEMO_USER.name,
      reporterEmail: input.reporterEmail || CURRENT_DEMO_USER.email,
      detectedLabels: analysis.labels,
    };

    const newListing = await DynamoDbService.createListing(listingData);

    // Compute immediate matching candidates
    const allListings = await DynamoDbService.getListings();
    const candidateMatches = findMatchesForListing(newListing, allListings);

    return NextResponse.json(
      {
        success: true,
        data: {
          listing: newListing,
          matches: candidateMatches,
          detectedLabels: analysis.labels,
          isSimulatedRekognition: analysis.isSimulated,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create listing";
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}
