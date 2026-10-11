import { PublishCommand } from "@aws-sdk/client-sns";
import { getSNSClient, isLiveMode } from "./config";

export interface PublishAlertParams {
  topicArn?: string;
  subject: string;
  message: string;
}

export interface PublishResult {
  published: boolean;
  messageId?: string;
  isSimulated: boolean;
  reason?: string;
}

export async function publishMatchAlertSns(
  params: PublishAlertParams
): Promise<PublishResult> {
  const topicArn = params.topicArn || process.env.AWS_SNS_TOPIC_ARN;
  const isSnsEnabled = process.env.AWS_SNS_ENABLED === "true";

  if (!isLiveMode() || !isSnsEnabled || !topicArn) {
    return {
      published: false,
      isSimulated: true,
      reason: isLiveMode()
        ? "SNS notifications disabled or AWS_SNS_TOPIC_ARN not configured"
        : "Demo Mode active (SNS publication simulated)",
    };
  }

  try {
    const snsClient = getSNSClient();
    const command = new PublishCommand({
      TopicArn: topicArn,
      Subject: params.subject.substring(0, 100),
      Message: params.message,
    });

    const response = await snsClient.send(command);
    return {
      published: true,
      messageId: response.MessageId,
      isSimulated: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to publish to SNS";
    return {
      published: false,
      isSimulated: false,
      reason: message,
    };
  }
}
