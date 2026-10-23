"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface CategoryData {
  category: string;
  name: string;
  count: number;
  color: string;
}

interface CategoryDistributionChartProps {
  activities: Array<{
    category: string;
  }>;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  career: { label: "Career", color: "#C98A4C" },
  social: { label: "Social", color: "#C25B4E" },
  health: { label: "Health", color: "#3B8A6E" },
  learning: { label: "Learning", color: "#3D78A8" },
  leisure: { label: "Leisure", color: "#8C5DA6" },
  routine: { label: "Routine", color: "#6E737B" },
  other: { label: "Other", color: "#9E8C78" },
};

export default function CategoryDistributionChart({
  activities,
}: CategoryDistributionChartProps) {
  const chartData: CategoryData[] = useMemo(() => {
    const counts: Record<string, number> = {
      career: 0,
      social: 0,
      health: 0,
      learning: 0,
      leisure: 0,
      routine: 0,
    };

    for (const act of activities) {
      const cat = act.category?.toLowerCase() || "routine";
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts.other = (counts.other || 0) + 1;
      }
    }

    return Object.entries(counts).map(([key, count]) => ({
      category: key,
      name: CATEGORY_CONFIG[key]?.label || key,
      count,
      color: CATEGORY_CONFIG[key]?.color || "#888888",
    }));
  }, [activities]);

  const totalLogs = activities.length;

  return (
    <div className="rounded-2xl bg-surface border border-border-hairline p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-lg text-foreground font-medium">
            Category Distribution
          </h3>
          <p className="text-xs font-mono text-muted">
            {totalLogs} memories analyzed in longitudinal record
          </p>
        </div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-faint px-2.5 py-1 rounded bg-canvas border border-border-hairline">
          Aggregated
        </span>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-text-muted, #737373)", fontSize: 12, fontFamily: "var(--font-inter, sans-serif)" }}
              width={75}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as CategoryData;
                  const pct = totalLogs > 0 ? Math.round((data.count / totalLogs) * 100) : 0;
                  return (
                    <div className="rounded-lg bg-canvas text-foreground border border-border-hairline px-3 py-2 shadow-md text-xs font-sans">
                      <p className="font-medium font-serif" style={{ color: data.color }}>
                        {data.name}
                      </p>
                      <p className="font-mono text-muted mt-0.5">
                        {data.count} entries ({pct}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.category}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
