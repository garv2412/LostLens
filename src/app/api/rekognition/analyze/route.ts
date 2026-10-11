import { NextRequest, NextResponse } from "next/server";
import { analyzeItemImage } from "@/lib/aws/rekognition";
import { ItemCategory } from "@/lib/types/listing";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, title, color, s3Key, s3Bucket } = body;

    if (!category || !title) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: category and title are required for image label analysis",
        },
        { status: 400 }
      );
    }

    const result = await analyzeItemImage({
      category: category as ItemCategory,
      title,
      color,
      s3Key,
      s3Bucket,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to analyze image";
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}
