"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon, ChartPieIcon } from "@heroicons/react/24/outline";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type ContractorStats = {
  name: string;
  total: number;
  received: number;
  remaining: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: ContractorStats[];
  type: "total" | "received" | "remaining";
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#a855f7",
  "#ec4899",
  "#6366f1",
];

export default function ContractorPieChartModal({
  isOpen,
  onClose,
  data,
  type,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case "total":
        return "Total Invoiced by Contractor";
      case "received":
        return "Received Amount by Contractor";
      case "remaining":
        return "Remaining Pending by Contractor";
    }
  };

  const chartData = data
    .map((item) => ({
      name: item.name,
      value: item[type],
    }))
    .filter((item) => item.value > 0);

  const formatCurrency = (val: number) => {
    return `AED ${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(17, 24, 39, 0.6)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div
        style={{
          position: "relative",
          zIndex: 100000,
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "85vh",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #f3f4f6",
            backgroundColor: "white",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ChartPieIcon
              style={{ height: "24px", width: "24px", color: "#4f46e5" }}
            />
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "#111827",
                margin: 0,
              }}
            >
              Contractor Breakdown
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              borderRadius: "9999px",
              padding: "0.5rem",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.color = "#6b7280";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#9ca3af";
            }}
          >
            <XMarkIcon style={{ height: "24px", width: "24px" }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem", overflowY: "auto" }}>
          <div style={{ marginBottom: "1rem", textAlign: "center" }}>
            <h4 style={{ margin: 0, fontSize: "1rem", color: "#6b7280" }}>
              {getTitle()}
            </h4>
          </div>
          <div style={{ height: "350px", width: "100%" }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const mAngle = midAngle ?? 0;
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-mAngle * RADIAN);
                      const y = cy + radius * Math.sin(-mAngle * RADIAN);

                      const p = percent ?? 0;

                      return p > 0.05 ? (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          style={{ fontSize: "12px", fontWeight: "bold" }}
                        >
                          {`${(p * 100).toFixed(0)}%`}
                        </text>
                      ) : null;
                    }}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  display: "flex",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <ChartPieIcon
                  style={{ height: "48px", width: "48px", color: "#e5e7eb" }}
                />
                <span>No data available for this selection</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
