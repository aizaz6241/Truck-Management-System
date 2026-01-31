"use client";

import { useEffect, useState } from "react";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { getRevenueStats, FilterType } from "@/actions/analytics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function RevenueCard() {
  const [filter, setFilter] = useState<FilterType>("today");
  const [customDate, setCustomDate] = useState("");
  const [revenue, setRevenue] = useState(0);
  const [trend, setTrend] = useState<{ date: string; amount: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchRevenue() {
      setIsLoading(true);
      try {
        if (
          (filter === "date" || filter === "month" || filter === "year") &&
          !customDate
        ) {
          setIsLoading(false);
          return;
        }

        const stats = await getRevenueStats(filter, customDate);
        setRevenue(stats.totalRevenue);
        setTrend(stats.trend || []);
      } catch (error) {
        console.error("Failed to fetch revenue stats", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRevenue();
    const interval = setInterval(fetchRevenue, 120000);
    return () => clearInterval(interval);
  }, [filter, customDate]);

  return (
    <div className="card" style={{ marginTop: "2rem", padding: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              padding: "0.5rem",
              borderRadius: "0.5rem",
              backgroundColor: "#d1fae5", // green-100
              color: "#059669", // green-600
            }}
          >
            <BanknotesIcon style={{ height: "24px", width: "24px" }} />
          </div>
          <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Revenue Analytics</h3>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as FilterType);
              setCustomDate("");
            }}
            className="form-select"
            style={{
              padding: "0.375rem 0.75rem",
              fontSize: "0.875rem",
              width: "auto",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
            }}
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last 1 Year</option>
            <option value="3y">Last 3 Years</option>
            <option value="all">All Time</option>
            <option value="date">Specific Date</option>
            <option value="month">Specific Month</option>
            <option value="year">Specific Year</option>
          </select>

          {filter === "date" && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="form-input"
              style={{
                padding: "0.25rem",
                width: "auto",
                fontSize: "0.875rem",
              }}
            />
          )}
          {filter === "month" && (
            <input
              type="month"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="form-input"
              style={{
                padding: "0.25rem",
                width: "auto",
                fontSize: "0.875rem",
              }}
            />
          )}
          {filter === "year" && (
            <input
              type="number"
              placeholder="Year"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="form-input"
              style={{
                padding: "0.25rem",
                width: "100px",
                fontSize: "0.875rem",
              }}
            />
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {/* Left Section (40%) - Amount */}
        <div
          style={{
            flex: "2",
            minWidth: "250px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "1.5rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "0.5rem",
              border: "1px solid #e5e7eb",
              height: "100%",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "#6b7280",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Total Estimated Revenue
            </p>
            <div
              style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}
            >
              <span
                style={{
                  fontSize: "3rem",
                  fontWeight: "800",
                  color: "#059669", // emerald-600
                  lineHeight: 1,
                }}
              >
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  `AED ${revenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                )}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#9ca3af" }}>
              * Based on completed trips & rates.
            </p>
          </div>
        </div>

        {/* Right Section (60%) - Chart */}
        <div style={{ flex: "3", minWidth: "300px", height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            {filter === "year" ||
            filter === "3y" ||
            filter === "all" ||
            filter === "1y" ||
            filter === "6m" ||
            filter === "30d" ||
            filter === "7d" ? (
              <LineChart
                data={trend}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
                    `AED ${Number(value).toLocaleString()}`,
                    "Revenue",
                  ]}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString()
                  }
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={trend}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
                  cursor={{ fill: "#f5f5f5" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: any) => [
                    `AED ${Number(value).toLocaleString()}`,
                    "Revenue",
                  ]}
                  labelFormatter={(label) => new Date(label).toDateString()}
                />
                <Bar
                  dataKey="amount"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
