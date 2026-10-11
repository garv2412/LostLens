import { DetectLabelsCommand } from "@aws-sdk/client-rekognition";
import { getRekognitionClient, isLiveMode } from "./config";
import { DetectedLabel, ItemCategory } from "../types/listing";
import { simulateRekognitionLabels } from "../demo/simulatedRekognition";

export interface AnalyzeImageOptions {
  category: ItemCategory;
  title: string;
  color?: string;
  s3Bucket?: string;
  s3Key?: string;
  imageBytes?: Uint8Array;
}

export async function analyzeItemImage(
  options: AnalyzeImageOptions
): Promise<{ labels: DetectedLabel[]; isSimulated: boolean; error?: string }> {
  // If not live mode or missing S3/bytes, fallback to simulated analysis
  if (!isLiveMode() || (!options.s3Key && !options.imageBytes)) {
    const labels = await simulateRekognitionLabels(options.category, options.title, options.color);
    return {
      labels,
      isSimulated: true,
    };
  }

  try {
    const client = getRekognitionClient();
    const minConfidence = parseInt(process.env.REKOGNITION_MIN_CONFIDENCE || "75", 10);

    const command = new DetectLabelsCommand({
      Image: options.s3Key
        ? {
            S3Object: {
              Bucket: options.s3Bucket || process.env.AWS_S3_BUCKET_NAME,
              Name: options.s3Key,
            },
          }
        : {
            Bytes: options.imageBytes,
          },
      MaxLabels: 15,
      MinConfidence: minConfidence,
    });

    const response = await client.send(command);
    const labels: DetectedLabel[] = (response.Labels || []).map((l) => ({
      name: l.Name || "Unknown",
      confidence: Math.round((l.Confidence || 0) * 10) / 10,
      parents: (l.Parents || []).map((p) => p.Name || "").filter(Boolean),
      isSimulated: false,
    }));

    return {
      labels,
      isSimulated: false,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown Rekognition error";
    // Graceful fallback to simulated labels so the user flow never breaks
    const fallbackLabels = await simulateRekognitionLabels(options.category, options.title, options.color);
    return {
      labels: fallbackLabels,
      isSimulated: true,
      error: `Rekognition service call failed (${errorMessage}). Reverted to simulated labels.`,
    };
  }
}
