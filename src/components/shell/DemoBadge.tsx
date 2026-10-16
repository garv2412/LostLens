"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  RefreshCw,
  Info,
  CloudOff,
  Cloud,
  CheckCircle2,
  X,
  Database,
  HardDrive,
  Eye,
  Globe,
  Radio,
} from "lucide-react";
import { Button } from "../ui/Button";

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
  const [showCard, setShowCard] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  // Close overlay card when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowCard(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowCard(false);
      }
    };

    if (showCard) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCard]);

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
    <div className="relative" ref={cardRef}>
      <div className="flex items-center gap-2">
        {isLive ? (
          <button
            onClick={() => setShowCard(!showCard)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all shadow-xs cursor-pointer"
            title="LostLens is operating in Live AWS Cloud Mode"
            aria-expanded={showCard}
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
              onClick={() => setShowCard(!showCard)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shadow-2xs cursor-pointer"
              title="Click to view Demo Mode details"
              aria-expanded={showCard}
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

      {/* Neat Overlay Card Popover */}
      {showCard && (
        <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 top-full mt-2.5 w-[calc(100vw-2rem)] max-w-[380px] sm:w-[400px] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 z-50 p-4 sm:p-5 animate-fade-in text-left">
          {/* Top Arrow Notch */}
          <div className="hidden sm:block absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-t border-l border-slate-200/90 dark:border-slate-800 rotate-45" />

          {/* Card Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl ${
                  isLive
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                }`}
              >
                {isLive ? <Cloud className="h-5 w-5" /> : <CloudOff className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  {isLive ? "Live AWS Cloud Mode" : "Demo Mode"}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      isLive
                        ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300"
                    }`}
                  >
                    {isLive ? "Production" : "Local Mock"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isLive
                    ? "Production serverless cloud architecture"
                    : "Zero-credential local storage simulation"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCard(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close card"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Banner Description */}
          <div className="mt-3.5">
            {isLive ? (
              <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 p-3 border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-2.5">
                <Radio className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  LostLens is connected to live AWS native services. Reports, claims, and photos automatically sync in real-time across all devices.
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/30 p-3 border border-amber-200/60 dark:border-amber-800/40 flex items-start gap-2.5">
                <CloudOff className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  Running locally without AWS credentials. Reports and claims persist in browser storage.
                </p>
              </div>
            )}
          </div>

          {/* Cloud Services Grid */}
          <div className="mt-3.5 grid grid-cols-2 gap-2.5">
            {/* Amazon DynamoDB */}
            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Database className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">DynamoDB</span>
                </div>
                {isLive && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isLive ? "Listings & Claims Table" : "LocalStorage"}
              </p>
            </div>

            {/* Amazon S3 Bucket */}
            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <HardDrive className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">S3 Bucket</span>
                </div>
                {isLive && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={status?.services.s3.bucket}>
                {isLive ? status?.services.s3.bucket || "Presigned Uploads" : "Simulated Upload"}
              </p>
            </div>

            {/* Amazon Rekognition */}
            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Eye className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">Rekognition</span>
                </div>
                {isLive && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isLive ? `AI Tagging (≥${status?.services.rekognition.minConfidence || 75}%)` : "Simulated Tagging"}
              </p>
            </div>

            {/* AWS Region */}
            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Globe className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">AWS Region</span>
                </div>
                {isLive && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isLive ? status?.awsRegion || "ap-south-1" : "Local Browser"}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            {!isLive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                isLoading={isResetting}
                className="h-8 text-xs"
              >
                Reset Seed Data
              </Button>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                All services operational
              </span>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCard(false)}
              className="h-8 text-xs px-3"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

