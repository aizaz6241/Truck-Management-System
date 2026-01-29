"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Trip {
  id: number;
  fromLocation: string;
  toLocation: string;
  vehicle: {
    number: string;
    ownership: string;
  };
  driver: {
    name: string;
  };
}

interface RvtTripsPieChartProps {
  trips: Trip[];
}

export default function RvtTripsPieChart({ trips }: RvtTripsPieChartProps) {
  // Aggregate trips by vehicle
  const aggregation: { [key: string]: number } = {};

  trips.forEach((trip) => {
    const vNo = trip.vehicle.number;
    aggregation[vNo] = (aggregation[vNo] || 0) + 1;
  });

  const data = Object.entries(aggregation)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Sort descending

  const COLORS = [
    "#2563eb", // blue-600
    "#e67e22", // orange
    "#10b981", // emerald-500
    "#8b5cf6", // violet-500
    "#f43f5e", // rose-500
    "#f59e0b", // amber-500
    "#6366f1", // indigo-500
    "#ec4899", // pink-500
  ];

  if (data.length === 0) {
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
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
        />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{
            fontSize: "0.75rem",
            color: "#4b5563",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
