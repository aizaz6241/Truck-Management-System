"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ContractorTripsPieChartProps {
  data: { name: string; value: number }[];
}

export default function ContractorTripsPieChart({
  data,
}: ContractorTripsPieChartProps) {
  const COLORS = [
    "#2563eb", // blue-600
    "#e67e22", // orange
    "#10b981", // emerald-500
    "#8b5cf6", // violet-500
    "#f43f5e", // rose-500
    "#f59e0b", // amber-500
    "#6366f1", // indigo-500
    "#ec4899", // pink-500
    "#14b8a6", // teal-500
    "#84cc16", // lime-500
    "#9ca3af", // gray-400 (for others/unknown)
  ];

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: "0.875rem",
        }}
      >
        No data for chart
      </div>
    );
  }

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    value,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{
          fontSize: "12px",
          fontWeight: "bold",
          textShadow: "0px 0px 2px rgba(0,0,0,0.5)",
          pointerEvents: "none",
        }}
      >
        {value}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80} // Increased from 60
          outerRadius={160} // Increased from 90
          paddingAngle={2}
          dataKey="value"
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            fontSize: "0.875rem",
          }}
          itemStyle={{ color: "#374151" }}
          formatter={(value: any) => [`${value} Trips`, "Trips"]}
        />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{
            fontSize: "0.85rem",
            color: "#4b5563",
            maxHeight: "400px",
            overflowY: "auto",
            paddingLeft: "20px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
