"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  getAllContractors,
  getContractorTimeline,
  FilterType,
} from "@/actions/analytics";
import {
  UserCircleIcon,
  ChartPieIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

type ContractorStats = {
  name: string;
  total: number;
  received: number;
  remaining: number;
};

type Props = {
  contractorStats: ContractorStats[];
  filter: FilterType;
  customDate: string;
};

const COLORS = ["#16a34a", "#ea580c"]; // Green (Received), Orange (Remaining)

export default function ContractorPaymentProfile({
  contractorStats,
  filter,
  customDate,
}: Props) {
  const [contractors, setContractors] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedContractor, setSelectedContractor] = useState<string>("");
  const [viewMode, setViewMode] = useState<"summary" | "timeline">("summary");
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  useEffect(() => {
    async function fetchContractors() {
      try {
        const list = await getAllContractors();
        setContractors(list);
      } catch (error) {
        console.error("Failed to fetch contractors", error);
      }
    }
    fetchContractors();
  }, []);

  useEffect(() => {
    async function fetchTimeline() {
      if (viewMode === "timeline" && selectedContractor) {
        const contractor = contractors.find(
          (c) => c.name === selectedContractor,
        );
        if (contractor) {
          setLoadingTimeline(true);
          try {
            const data = await getContractorTimeline(
              contractor.id,
              filter,
              customDate,
            );
            setTimelineData(data);
          } catch (error) {
            console.error("Failed to fetch timeline", error);
          } finally {
            setLoadingTimeline(false);
          }
        }
      }
    }

    fetchTimeline();
  }, [viewMode, selectedContractor, filter, customDate, contractors]);

  const formatCurrency = (val: number) => {
    return `AED ${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const selectedStats = contractorStats.find(
    (c) => c.name === selectedContractor,
  );

  const chartData = selectedStats
    ? [
        { name: "Received", value: selectedStats.received },
        { name: "Remaining", value: selectedStats.remaining },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1.5rem",
        backgroundColor: "white",
        borderRadius: "0.75rem",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              padding: "0.5rem",
              borderRadius: "0.5rem",
              backgroundColor: "#f3f4f6", // gray-100
              color: "#4b5563", // gray-600
            }}
          >
            <UserCircleIcon style={{ height: "24px", width: "24px" }} />
          </div>
          <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#111827" }}>
            Payment by Contractor Profile
          </h3>
        </div>

        {selectedContractor && (
          <div
            style={{
              display: "flex",
              backgroundColor: "#f3f4f6",
              padding: "0.25rem",
              borderRadius: "0.5rem",
            }}
          >
            <button
              onClick={() => setViewMode("summary")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                backgroundColor:
                  viewMode === "summary" ? "white" : "transparent",
                color: viewMode === "summary" ? "#111827" : "#6b7280",
                boxShadow:
                  viewMode === "summary"
                    ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                    : "none",
                transition: "all 0.2s",
              }}
            >
              <ChartPieIcon style={{ width: "16px", height: "16px" }} />
              Summary
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                backgroundColor:
                  viewMode === "timeline" ? "white" : "transparent",
                color: viewMode === "timeline" ? "#111827" : "#6b7280",
                boxShadow:
                  viewMode === "timeline"
                    ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                    : "none",
                transition: "all 0.2s",
              }}
            >
              <ChartBarIcon style={{ width: "16px", height: "16px" }} />
              Timeline
            </button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label
          htmlFor="contractor-select"
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "0.5rem",
          }}
        >
          Select Contractor
        </label>
        <select
          id="contractor-select"
          value={selectedContractor}
          onChange={(e) => {
            setSelectedContractor(e.target.value);
            // Default back to summary when changing contractor? Or keep view?
            // Keeping view is usually better UX
          }}
          className="form-select"
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "0.5rem",
            borderRadius: "0.375rem",
            border: "1px solid #d1d5db",
            fontSize: "0.875rem",
          }}
        >
          <option value="">-- Choose a Contractor --</option>
          {contractors.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedContractor ? (
        viewMode === "summary" ? (
          /* Summary View (Pie Chart) */
          selectedStats ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{ height: "300px", width: "100%", maxWidth: "500px" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => {
                        const p = percent ?? 0;
                        return `${name} ${(p * 100).toFixed(0)}%`;
                      }}
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
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                  marginTop: "1rem",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      margin: 0,
                    }}
                  >
                    Total Invoiced
                  </p>
                  <p
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "700",
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    {formatCurrency(selectedStats.total)}
                  </p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#16a34a",
                      margin: 0,
                    }}
                  >
                    Received
                  </p>
                  <p
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "700",
                      color: "#16a34a",
                      margin: 0,
                    }}
                  >
                    {formatCurrency(selectedStats.received)}
                  </p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#ea580c",
                      margin: 0,
                    }}
                  >
                    Remaining
                  </p>
                  <p
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "700",
                      color: "#ea580c",
                      margin: 0,
                    }}
                  >
                    {formatCurrency(selectedStats.remaining)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#6b7280",
                fontSize: "0.875rem",
              }}
            >
              No data available for <strong>{selectedContractor}</strong> in the
              selected date range.
            </div>
          )
        ) : (
          /* Timeline View (Line Chart) */
          <div style={{ height: "400px", width: "100%", marginTop: "1rem" }}>
            {loadingTimeline ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                }}
              >
                Loading timeline...
              </div>
            ) : timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timelineData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#eee"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#666" }}
                    tickFormatter={(val) => {
                      if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
                      return val;
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: any) => [
                      formatCurrency(Number(value)),
                      "",
                    ]}
                    labelFormatter={(label) => new Date(label).toDateString()}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="invoiced"
                    name="Invoiced"
                    stroke="#4f46e5" // Indigo
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#4f46e5" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="received"
                    name="Received"
                    stroke="#16a34a" // Green
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#16a34a" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                  backgroundColor: "#f9fafb",
                  borderRadius: "0.5rem",
                }}
              >
                No timeline data available for this range.
              </div>
            )}
          </div>
        )
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "#9ca3af",
            border: "2px dashed #e5e7eb",
            borderRadius: "0.5rem",
          }}
        >
          Please select a contractor to view their payment profile.
        </div>
      )}
    </div>
  );
}
