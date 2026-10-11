import { S3Client } from "@aws-sdk/client-s3";
import { RekognitionClient } from "@aws-sdk/client-rekognition";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SNSClient } from "@aws-sdk/client-sns";

export function getAppMode(): "demo" | "live" {
  const configuredMode = process.env.NEXT_PUBLIC_APP_MODE;
  if (configuredMode === "live") {
    // Only return 'live' if AWS credentials or region are actually present
    const hasAwsCreds =
      Boolean(process.env.AWS_REGION) &&
      (Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ||
        Boolean(process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI));
    if (hasAwsCreds) {
      return "live";
    }
  }
  return "demo";
}

export function isLiveMode(): boolean {
  return getAppMode() === "live";
}

export function getAwsRegion(): string {
  return process.env.AWS_REGION || "us-east-1";
}

// Lazy-initialized AWS Clients
let s3ClientInstance: S3Client | null = null;
export function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: getAwsRegion(),
    });
  }
  return s3ClientInstance;
}

let rekognitionClientInstance: RekognitionClient | null = null;
export function getRekognitionClient(): RekognitionClient {
  if (!rekognitionClientInstance) {
    rekognitionClientInstance = new RekognitionClient({
      region: getAwsRegion(),
    });
  }
  return rekognitionClientInstance;
}

let dynamoDocClientInstance: DynamoDBDocumentClient | null = null;
export function getDynamoDocClient(): DynamoDBDocumentClient {
  if (!dynamoDocClientInstance) {
    const rawClient = new DynamoDBClient({
      region: getAwsRegion(),
    });
    dynamoDocClientInstance = DynamoDBDocumentClient.from(rawClient, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: false,
      },
    });
  }
  return dynamoDocClientInstance;
}

let snsClientInstance: SNSClient | null = null;
export function getSNSClient(): SNSClient {
  if (!snsClientInstance) {
    snsClientInstance = new SNSClient({
      region: getAwsRegion(),
    });
  }
  return snsClientInstance;
}
