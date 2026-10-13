"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw, Info, CloudOff } from "lucide-react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

export const DemoBadge: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

  return (
    <>
      <div className="flex items-center gap-2">
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
      </div>

      <Modal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        title="LostLens Environment Status: Demo Mode"
        description="Zero-credential local mode with client persistence and simulation"
        maxWidth="lg"
      >
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="rounded-lg bg-amber-50/80 dark:bg-amber-950/40 p-3.5 border border-amber-200/60 dark:border-amber-800/60 flex items-start gap-3">
            <CloudOff className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <p className="font-semibold mb-0.5">Operating Locally Without AWS Credentials</p>
              <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                All data, Rekognition label extractions, and image uploads operate in client-persistent Demo Mode.
                Live AWS connections (S3, Rekognition, DynamoDB, SNS) are automatically preserved for configured production environments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Active Storage</div>
              <p className="text-slate-500 dark:text-slate-400">Browser LocalStorage + In-Memory Seed Fallback</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Visual Tagging</div>
              <p className="text-slate-500 dark:text-slate-400">Simulated Rekognition (Clearly Tagged)</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Matching Engine</div>
              <p className="text-slate-500 dark:text-slate-400">Deterministic Weighted Engine (Active)</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Current Identity</div>
              <p className="text-slate-500 dark:text-slate-400">Maya Lin (Student, CS Dept)</p>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              isLoading={isResetting}
            >
              Reset to Default Seed Data
            </Button>
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
