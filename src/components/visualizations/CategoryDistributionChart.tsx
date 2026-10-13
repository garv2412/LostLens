"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useTheme } from "../theme/ThemeProvider";

export interface CategoryDistributionProps {
  data?: { category: string; count: number }[];
}

const DEFAULT_CATEGORY_DATA = [
  { category: "Backpacks", count: 8 },
  { category: "Water Bottles", count: 6 },
  { category: "Headphones", count: 5 },
  { category: "Electronics", count: 4 },
  { category: "Books", count: 4 },
  { category: "Keys", count: 3 },
  { category: "Umbrellas", count: 3 },
  { category: "Chargers", count: 3 },
];

export const CategoryDistributionChart: React.FC<CategoryDistributionProps> = ({
  data = DEFAULT_CATEGORY_DATA,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const gridStroke = isDark ? "#1e293b" : "#f1f5f9";
  const tickColorX = isDark ? "#94a3b8" : "#64748b";
  const tickColorY = isDark ? "#cbd5e1" : "#475569";
  const axisStroke = isDark ? "#334155" : "#e2e8f0";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const tooltipColor = isDark ? "#f8fafc" : "#0f172a";

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: tickColorX }}
            axisLine={{ stroke: axisStroke }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 11, fill: tickColorY }}
            axisLine={false}
            tickLine={false}
            width={90}
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
          <Bar dataKey="count" name="Reports" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
