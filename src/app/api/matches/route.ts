import { NextRequest, NextResponse } from "next/server";
import { DemoStore } from "@/lib/demo/store";
import { MatchStatus, MatchStrength } from "@/lib/types/match";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");
    const strength = searchParams.get("strength") as MatchStrength | null;
    const status = searchParams.get("status") as MatchStatus | null;

    let matches = DemoStore.getAllMatches();

    if (listingId) {
      matches = matches.filter(
        (m) => m.lostListingId === listingId || m.foundListingId === listingId
      );
    }
    if (strength && strength !== ("all" as any)) {
      matches = matches.filter((m) => m.strength === strength);
    }
    if (status && status !== ("all" as any)) {
      matches = matches.filter((m) => m.status === status);
    }

    return NextResponse.json({
      success: true,
      data: matches,
      meta: {
        total: matches.length,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch matches";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { matchId, status } = body;

    const validStatuses: MatchStatus[] = ["candidate", "reviewing", "confirmed", "dismissed"];
    if (!matchId || !status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid match update request: matchId and valid status required",
        },
        { status: 400 }
      );
    }

    DemoStore.updateMatchStatus(matchId, status);

    return NextResponse.json({
      success: true,
      data: {
        matchId,
        status,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update match status";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
