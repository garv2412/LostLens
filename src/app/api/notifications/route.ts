import { NextRequest, NextResponse } from "next/server";
import { DemoStore } from "@/lib/demo/store";
import { CURRENT_DEMO_USER } from "@/lib/demo/seedData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || CURRENT_DEMO_USER.id;
    const notifications = DemoStore.getNotifications(userId);

    return NextResponse.json({
      success: true,
      data: notifications,
      meta: {
        total: notifications.length,
        unread: notifications.filter((n) => !n.isRead).length,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch notifications";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      DemoStore.markAllNotificationsRead();
      return NextResponse.json({ success: true, message: "All marked as read" });
    }

    if (notificationId) {
      DemoStore.markNotificationRead(notificationId);
      return NextResponse.json({ success: true, message: "Marked as read" });
    }

    return NextResponse.json(
      { success: false, error: "Missing notificationId or markAll flag" },
      { status: 400 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update notification";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
