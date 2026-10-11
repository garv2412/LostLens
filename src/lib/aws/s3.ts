import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client, isLiveMode, getAwsRegion } from "./config";

export interface PresignedUrlResult {
  uploadUrl: string;
  fileKey: string;
  finalPublicUrl: string;
  isSimulated: boolean;
}

/**
 * Generate a presigned S3 upload URL or fallback to simulated upload URL in demo mode.
 */
export async function createPresignedUploadUrl(
  fileName: string,
  contentType: string
): Promise<PresignedUrlResult> {
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueKey = `items/${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${sanitizedFileName}`;
  const bucketName = process.env.AWS_S3_BUCKET_NAME || "lostlens-item-photos-dev";

  if (!isLiveMode()) {
    // Demo Mode: Return simulated endpoint
    return {
      uploadUrl: `/api/upload/demo-mock?key=${encodeURIComponent(uniqueKey)}`,
      fileKey: uniqueKey,
      finalPublicUrl: `https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80`,
      isSimulated: true,
    };
  }

  const s3 = getS3Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueKey,
    ContentType: contentType,
  });

  const expiresInSeconds = parseInt(process.env.AWS_S3_PRESIGNED_EXPIRATION_SECONDS || "900", 10);
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
  const finalPublicUrl = `https://${bucketName}.s3.${getAwsRegion()}.amazonaws.com/${uniqueKey}`;

  return {
    uploadUrl,
    fileKey: uniqueKey,
    finalPublicUrl,
    isSimulated: false,
  };
}
