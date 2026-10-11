import { NextRequest, NextResponse } from "next/server";
import { CreateClaimSchema, ClaimDecisionSchema } from "@/lib/validation/schemas";
import { DemoStore } from "@/lib/demo/store";
import { ClaimStatus } from "@/lib/types/claim";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");

    let claims = DemoStore.getClaims();
    if (listingId) {
      claims = claims.filter((c) => c.listingId === listingId);
    }

    return NextResponse.json({
      success: true,
      data: claims,
      meta: {
        total: claims.length,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch claims";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateClaimSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed for claim submission",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const newClaim = DemoStore.createClaim(
      input.listingId,
      input.distinguishingDetails,
      input.additionalProof,
      input.matchId
    );

    return NextResponse.json(
      {
        success: true,
        data: newClaim,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit claim";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ClaimDecisionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed for claim decision",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { claimId, decision, decisionNote } = parsed.data;
    const targetStatus: ClaimStatus = decision === "accept" ? "accepted" : "rejected";

    const updated = DemoStore.updateClaimStatus(claimId, targetStatus, decisionNote);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Claim not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update claim";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
