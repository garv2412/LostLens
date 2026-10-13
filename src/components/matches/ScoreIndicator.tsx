import React from "react";
import { MatchStrength } from "@/lib/types/match";
import { getScoreBadgeClass } from "@/lib/utils/formatters";

export interface ScoreIndicatorProps {
  score: number;
  strength: MatchStrength;
  size?: "sm" | "md" | "lg";
}

export const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({
  score,
  strength,
  size = "md",
}) => {
  const rounded = Math.round(score);
  const color = getScoreBadgeClass(rounded);

  const strengthLabels = {
    strong: "Strong Match",
    possible: "Possible Match",
    weak: "Low Similarity",
  };

  if (size === "sm") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${color.badge}`}
      >
        <span>{rounded}%</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Score Badge */}
      <div
        className={`flex flex-col items-center justify-center rounded-xl p-2.5 min-w-[64px] border ${color.badge}`}
      >
        <span className="text-xl font-black tracking-tight leading-none">
          {rounded}%
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 opacity-80">
          Match
        </span>
      </div>

      <div>
        <div className={`text-xs font-bold ${color.text}`}>
          {strengthLabels[strength]}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {strength === "strong"
            ? "High attribute alignment"
            : strength === "possible"
            ? "Partial alignment - review clues"
            : "Significant conflicting attributes"}
        </div>
      </div>
    </div>
  );
};
