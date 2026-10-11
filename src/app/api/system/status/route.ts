import { NextResponse } from "next/server";
import { getAppMode, getAwsRegion, isLiveMode } from "@/lib/aws/config";
import { DemoStore } from "@/lib/demo/store";

export async function GET() {
  const mode = getAppMode();
  const stats = DemoStore.getSystemStats();

  return NextResponse.json({
    success: true,
    data: {
      mode,
      isLive: isLiveMode(),
      awsRegion: getAwsRegion(),
      stats,
      services: {
        s3: {
          status: isLiveMode() ? "connected" : "simulated",
          bucket: process.env.AWS_S3_BUCKET_NAME || "lostlens-item-photos-dev",
        },
        rekognition: {
          status: isLiveMode() ? "connected" : "simulated",
          minConfidence: parseInt(process.env.REKOGNITION_MIN_CONFIDENCE || "75", 10),
        },
        dynamodb: {
          status: isLiveMode() ? "connected" : "in_browser_persistent",
        },
        sns: {
          status: process.env.AWS_SNS_ENABLED === "true" && isLiveMode() ? "connected" : "simulated",
        },
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}
