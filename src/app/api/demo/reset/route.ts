import { NextResponse } from "next/server";
import { DemoStore } from "@/lib/demo/store";

export async function POST() {
  try {
    DemoStore.resetDemoData();
    return NextResponse.json({
      success: true,
      message: "Demo dataset reset successfully to initial state",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reset demo dataset";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
