import { NextRequest, NextResponse } from "next/server";
import { PresignedUrlRequestSchema } from "@/lib/validation/schemas";
import { createPresignedUploadUrl } from "@/lib/aws/s3";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PresignedUrlRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid upload request parameters",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const result = await createPresignedUploadUrl(
      parsed.data.fileName,
      parsed.data.contentType
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate presigned upload URL";
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}
