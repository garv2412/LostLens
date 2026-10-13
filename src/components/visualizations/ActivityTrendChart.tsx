"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useTheme } from "../theme/ThemeProvider";

export interface ActivityTrendProps {
  data?: { date: string; lost: number; found: number; recovered: number }[];
}

const DEFAULT_DATA = [
  { date: "Oct 03", lost: 3, found: 2, recovered: 1 },
  { date: "Oct 04", lost: 5, found: 4, recovered: 2 },
  { date: "Oct 05", lost: 4, found: 5, recovered: 3 },
  { date: "Oct 06", lost: 6, found: 7, recovered: 4 },
  { date: "Oct 07", lost: 8, found: 6, recovered: 5 },
  { date: "Oct 08", lost: 7, found: 9, recovered: 6 },
  { date: "Oct 09", lost: 9, found: 8, recovered: 7 },
  { date: "Oct 10", lost: 6, found: 8, recovered: 6 },
  { date: "Oct 11", lost: 8, found: 10, recovered: 7 },
  { date: "Oct 12", lost: 5, found: 6, recovered: 4 },
];

export const ActivityTrendChart: React.FC<ActivityTrendProps> = ({
  data = DEFAULT_DATA,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const gridStroke = isDark ? "#1e293b" : "#f1f5f9";
  const tickColor = isDark ? "#94a3b8" : "#64748b";
  const axisStroke = isDark ? "#334155" : "#e2e8f0";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const tooltipColor = isDark ? "#f8fafc" : "#0f172a";

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={{ stroke: axisStroke }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              color: tooltipColor,
              borderRadius: "0.75rem",
              border: `1px solid ${tooltipBorder}`,
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.2)",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="lost"
            name="Lost Reports"
            stroke="#f59e0b"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorLost)"
          />
          <Area
            type="monotone"
            dataKey="found"
            name="Found Reports"
            stroke="#4f46e5"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorFound)"
          />
          <Area
            type="monotone"
            dataKey="recovered"
            name="Items Recovered"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRecovered)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
