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
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 11, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "0.75rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="count" name="Reports" fill="#4f46e5" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
