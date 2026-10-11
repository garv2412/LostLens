# LostLens: AWS Cloud Architecture & Setup Guide

This guide details the complete AWS infrastructure setup for deploying **LostLens** in **Live AWS Mode**.

---

## 1. Cloud Architecture Overview

In Live Mode, LostLens leverages native AWS serverless and managed AI services:

```mermaid
flowchart TD
    User["Student / Staff Browser"]
    NextAPI["Next.js Server / AWS Lambda API"]
    S3["Amazon S3 Private Bucket\n(Object Storage for Photographs)"]
    Rekognition["Amazon Rekognition\n(DetectLabels Visual Tagging)"]
    Engine["LostLens Matching Engine\n(Deterministic 6-Factor Algorithm)"]
    Dynamo["Amazon DynamoDB Tables\n(Listings, Claims, Notifications)"]
    SNS["Amazon SNS\n(Match Alert Notifications)"]

    User -->|"1. Request presigned URL"| NextAPI
    NextAPI -->|"2. Generate signed PUT URL"| S3
    User -->|"3. Direct binary upload"| S3
    User -->|"4. Submit listing details"| NextAPI
    NextAPI -->|"5. DetectLabels (Image S3 Object)"| Rekognition
    Rekognition -->|"6. Return visual labels & confidence"| NextAPI
    NextAPI -->|"7. Save item record"| Dynamo
    NextAPI -->|"8. Calculate compatibility scores"| Engine
    Engine -->|"9. High-confidence match found"| Dynamo
    Engine -->|"10. Publish alert event"| SNS
    SNS -->|"11. SMS / Email notifications"| User
```

---

## 2. Amazon S3 Configuration

### Bucket Creation
Create a private S3 bucket in your target region (e.g., `us-east-1`):
```bash
aws s3api create-bucket \
    --bucket lostlens-item-photos-prod \
    --region us-east-1
```

### Block Public Access (Enforced)
Ensure all public access remains blocked:
```bash
aws s3api put-public-access-block \
    --bucket lostlens-item-photos-prod \
    --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### CORS Configuration
Allow presigned upload requests from the LostLens web domain:
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["PUT", "POST", "GET"],
      "AllowedOrigins": [
        "https://lostlens.vercel.app",
        "http://localhost:3000"
      ],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```
Apply the CORS policy:
```bash
aws s3api put-bucket-cors --bucket lostlens-item-photos-prod --cors-configuration file://s3-cors.json
```

---

## 3. Amazon DynamoDB Tables

Create the DynamoDB tables for listings, claims, and notifications.

### 1. `LostLens_Listings` Table
- **Partition Key**: `id` (String)
- **Billing Mode**: Pay-Per-Request (On-Demand)

```bash
aws dynamodb create-table \
    --table-name LostLens_Listings \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST
```

### 2. `LostLens_Claims` Table
- **Partition Key**: `id` (String)
- **Global Secondary Index**: `listingId-index` for querying claims by listing

```bash
aws dynamodb create-table \
    --table-name LostLens_Claims \
    --attribute-definitions AttributeName=id,AttributeType=S AttributeName=listingId,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --global-secondary-indexes "IndexName=listingId-index,KeySchema=[{AttributeName=listingId,KeyType=HASH}],Projection={ProjectionType=ALL}" \
    --billing-mode PAY_PER_REQUEST
```

### 3. `LostLens_Notifications` Table
- **Partition Key**: `id` (String)
- **Global Secondary Index**: `userId-createdAt-index` for querying user notifications chronologically

```bash
aws dynamodb create-table \
    --table-name LostLens_Notifications \
    --attribute-definitions AttributeName=id,AttributeType=S AttributeName=userId,AttributeType=S AttributeName=createdAt,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --global-secondary-indexes "IndexName=userId-createdAt-index,KeySchema=[{AttributeName=userId,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL}" \
    --billing-mode PAY_PER_REQUEST
```

---

## 4. Amazon Rekognition

LostLens uses `rekognition:DetectLabels` to extract visual tags from item photos:
- Minimum confidence: `75%`
- Max labels: `15`
- Extracted labels are stored with the listing metadata to drive the 35% visual similarity score component.

> **Note**: Rekognition provides label identification, not generic similarity comparison between two items. The candidate compatibility is calculated by LostLens's deterministic multi-factor matching engine.

---

## 5. Amazon SNS (Match Alerts)

Create an SNS Topic for broadcasting match notifications:
```bash
aws sns create-topic --name lostlens-match-alerts
```
Note the returned ARN (e.g., `arn:aws:sns:us-east-1:123456789012:lostlens-match-alerts`).

Subscribe administrative or student endpoints:
```bash
aws sns subscribe \
    --topic-arn arn:aws:sns:us-east-1:123456789012:lostlens-match-alerts \
    --protocol email \
    --notification-endpoint security@campus.edu
```

---

## 6. IAM Least-Privilege Policy

Attach the following policy to the IAM role or execution user running LostLens:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3PresignedUploadsAndAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::lostlens-item-photos-prod/*"
    },
    {
      "Sid": "RekognitionDetectLabels",
      "Effect": "Allow",
      "Action": [
        "rekognition:DetectLabels"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DynamoDbAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/LostLens_Listings*",
        "arn:aws:dynamodb:*:*:table/LostLens_Claims*",
        "arn:aws:dynamodb:*:*:table/LostLens_Notifications*"
      ]
    },
    {
      "Sid": "SNSPublishAlerts",
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "arn:aws:sns:*:*:lostlens-match-alerts"
    }
  ]
}
```

---

## 7. Environment Variables for Live Mode

Set the following environment variables in `.env.local` or your Vercel / serverless environment:

```env
NEXT_PUBLIC_APP_MODE=live
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

AWS_S3_BUCKET_NAME=lostlens-item-photos-prod
AWS_S3_PRESIGNED_EXPIRATION_SECONDS=900

DYNAMODB_TABLE_LISTINGS=LostLens_Listings
DYNAMODB_TABLE_CLAIMS=LostLens_Claims
DYNAMODB_TABLE_NOTIFICATIONS=LostLens_Notifications

REKOGNITION_MIN_CONFIDENCE=75

AWS_SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:lostlens-match-alerts
AWS_SNS_ENABLED=true
```

---

## 8. Cost Optimization & Cleanup

- **Free Tier Eligibility**: DynamoDB includes 25GB free storage; Rekognition includes 5,000 free image analyses per month during the first 12 months; S3 includes 5GB standard storage.
- **Teardown**: To delete all resources and stop incurring any costs:
```bash
aws s3 rb s3://lostlens-item-photos-prod --force
aws dynamodb delete-table --table-name LostLens_Listings
aws dynamodb delete-table --table-name LostLens_Claims
aws dynamodb delete-table --table-name LostLens_Notifications
aws sns delete-topic --topic-arn <TOPIC_ARN>
```
