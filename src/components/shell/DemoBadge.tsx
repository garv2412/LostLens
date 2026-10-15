"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Info, CloudOff, Cloud, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface SystemStatus {
  mode: "demo" | "live";
  isLive: boolean;
  awsRegion: string;
  services: {
    s3: { status: string; bucket?: string };
    rekognition: { status: string; minConfidence?: number };
    dynamodb: { status: string };
    sns: { status: string };
  };
}

export const DemoBadge: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    fetch("/api/system/status")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setStatus(json.data);
        }
      })
      .catch(() => {
        // Fallback silently if offline or failed
      });
  }, []);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch {
      // pass
    } finally {
      setIsResetting(false);
    }
  };

  const isLive = status?.isLive ?? false;

  return (
    <>
      <div className="flex items-center gap-2">
        {isLive ? (
          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-2xs"
            title="LostLens is operating in Live AWS Cloud Mode"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live AWS Mode</span>
            <Info className="h-3 w-3 text-emerald-600 dark:text-emerald-400 ml-0.5" />
          </button>
        ) : (
          <>
            <button
              onClick={() => setShowInfo(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shadow-2xs"
              title="Click to view Demo Mode details"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Demo Mode</span>
              <Info className="h-3 w-3 text-amber-500 dark:text-amber-400 ml-0.5" />
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              isLoading={isResetting}
              className="h-7 text-xs px-2 gap-1 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white dark:hover:bg-slate-800"
              title="Reset dataset to default 20+ seed listings"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Reset Demo</span>
            </Button>
          </>
        )}
      </div>

      <Modal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        title={isLive ? "LostLens: Live AWS Cloud Mode" : "LostLens Environment Status: Demo Mode"}
        description={
          isLive
            ? "Production-ready serverless architecture backed by AWS native services"
            : "Zero-credential local mode with client persistence and simulation"
        }
        maxWidth="lg"
      >
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          {isLive ? (
            <div className="rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 p-3.5 border border-emerald-200/60 dark:border-emerald-800/60 flex items-start gap-3">
              <Cloud className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200">
                <p className="font-semibold mb-0.5">Operating Live with Amazon Web Services</p>
                <p className="text-emerald-800/90 dark:text-emerald-300/80 leading-relaxed">
                  All listings are persisted in Amazon DynamoDB, item photographs are uploaded directly to Amazon S3 via presigned URLs, and visual tags are extracted in real-time by Amazon Rekognition.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-amber-50/80 dark:bg-amber-950/40 p-3.5 border border-amber-200/60 dark:border-amber-800/60 flex items-start gap-3">
              <CloudOff className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200">
                <p className="font-semibold mb-0.5">Operating Locally Without AWS Credentials</p>
                <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                  All data, Rekognition label extractions, and image uploads operate in client-persistent Demo Mode.
                  Live AWS connections are automatically activated when AWS credentials are provided.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                {isLive && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                Amazon DynamoDB
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                {isLive ? "Listings & Claims Table Active" : "Browser LocalStorage"}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                {isLive && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                Amazon S3 Bucket
              </div>
              <p className="text-slate-500 dark:text-slate-400 truncate">
                {isLive ? status?.services.s3.bucket || "Configured" : "Simulated Direct Upload"}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                {isLive && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                Amazon Rekognition
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                {isLive ? `Live Tagging (Min Conf: ${status?.services.rekognition.minConfidence || 75}%)` : "Simulated Tagging"}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                {isLive && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                AWS Region
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                {isLive ? status?.awsRegion || "us-east-1" : "Local Runtime"}
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
            {!isLive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                isLoading={isResetting}
              >
                Reset to Default Seed Data
              </Button>
            ) : <div />}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowInfo(false)}
            >
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
