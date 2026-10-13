import { NextRequest, NextResponse } from "next/server";
import { DynamoDbService } from "@/lib/aws/dynamodb";
import { CURRENT_DEMO_USER } from "@/lib/demo/seedData";
import { ListingStatus } from "@/lib/types/listing";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await DynamoDbService.getListingById(params.id);

    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    // Privacy protection: Do not expose secret verification clue unless the requester is the reporter
    const isOwner = listing.reporterId === CURRENT_DEMO_USER.id;
    const sanitizedListing = {
      ...listing,
      secretVerificationClue: isOwner ? listing.secretVerificationClue : undefined,
    };

    return NextResponse.json({
      success: true,
      data: sanitizedListing,
      meta: {
        isOwner,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch listing";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status } = body;

    const validStatuses: ListingStatus[] = ["active", "in_claim", "resolved", "closed"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await DynamoDbService.updateListingStatus(params.id, status);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Listing not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update listing";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await DynamoDbService.deleteListing(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Listing not found or could not be deleted" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete listing";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
