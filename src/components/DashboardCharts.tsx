"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Link from "next/link";
import {
  BriefcaseIcon,
  TruckIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { getPieStats, getRvtTrips, FilterType } from "@/actions/analytics";
import { getTripsByRange } from "@/actions/trip";
import RvtTripsModal from "./RvtTripsModal";
import RevenueCard from "./RevenueCard";
import InvoiceAnalytics from "./InvoiceAnalytics";
import DieselAnalytics from "./diesel/DieselAnalytics"; // ID: b3a2b94f-ff22-4af5-bc5d-bd607fce640e
import TaxiAnalytics from "./analytics/TaxiAnalytics"; // ID: 692c1db6-a229-4d79-8afc-e62afe5cf03a
import TaxiTripsModal from "./TaxiTripsModal";
import TotalTripsModal from "./TotalTripsModal";

export default function DashboardCharts({
  trend7Days,
  trend30Days,
  trend1Year,
  todayTrips,
}: {
  trend7Days: any[];
  trend30Days: any[];
  trend1Year: any[];
  todayTrips: any[];
}) {
  const [trendRange, setTrendRange] = useState<"7d" | "30d" | "1y">("7d");

  // Pie Chart State
  const [pieFilter, setPieFilter] = useState<FilterType>("today");
  const [customDate, setCustomDate] = useState(""); // For date, month, year inputs
  const [pieStats, setPieStats] = useState({
    rvt: todayTrips.filter((t) => t.vehicle.ownership === "RVT").length,
    taxi: todayTrips.filter((t) => t.vehicle.ownership === "Taxi").length,
    total: todayTrips.length,
  });
  const [loadingPie, setLoadingPie] = useState(false);
  const [showRvtModal, setShowRvtModal] = useState(false);
  const [rvtTrips, setRvtTrips] = useState<any[]>(
    todayTrips.filter((t) => t.vehicle.ownership === "RVT"),
  );
  const [showTaxiModal, setShowTaxiModal] = useState(false);
  const [taxiTrips, setTaxiTrips] = useState<any[]>(
    todayTrips.filter((t) => t.vehicle.ownership === "Taxi"),
  );
  const [showTotalModal, setShowTotalModal] = useState(false);
  const [totalTrips, setTotalTrips] = useState<any[]>(todayTrips);

  let data = trend7Days;
  if (trendRange === "30d") data = trend30Days;
  if (trendRange === "1y") data = trend1Year;

  // No longer needed as we fetch this dynamically
  // const rvtTripsDetails = todayTrips.filter(
  //   (t) => t.vehicle.ownership === "RVT",
  // );

  useEffect(() => {
    async function fetchPieData() {
      setLoadingPie(true);
      try {
        if (
          (pieFilter === "date" ||
            pieFilter === "month" ||
            pieFilter === "year") &&
          !customDate
        ) {
          setLoadingPie(false);
          return;
        }

        let startDate = new Date();
        let endDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if (pieFilter === "today") {
          // Already set
        } else if (pieFilter === "7d") {
          startDate.setDate(startDate.getDate() - 7);
        } else if (pieFilter === "30d") {
          startDate.setDate(startDate.getDate() - 30);
        } else if (pieFilter === "6m") {
          startDate.setMonth(startDate.getMonth() - 6);
        } else if (pieFilter === "1y") {
          startDate.setFullYear(startDate.getFullYear() - 1);
        } else if (pieFilter === "date" && customDate) {
          startDate = new Date(customDate);
          endDate = new Date(customDate);
          endDate.setHours(23, 59, 59, 999);
        } else if (pieFilter === "month" && customDate) {
          const [year, month] = customDate.split("-").map(Number);
          startDate = new Date(year, month - 1, 1);
          endDate = new Date(year, month, 0);
          endDate.setHours(23, 59, 59, 999);
        } else if (pieFilter === "year" && customDate) {
          const year = parseInt(customDate);
          startDate = new Date(year, 0, 1);
          endDate = new Date(year, 11, 31);
          endDate.setHours(23, 59, 59, 999);
        }

        const [stats, rvt, taxi, all] = await Promise.all([
          getPieStats(pieFilter, customDate),
          getRvtTrips(pieFilter, customDate),
          getTripsByRange(
            startDate.toISOString(),
            endDate.toISOString(),
            "Taxi",
          ),
          getTripsByRange(
            startDate.toISOString(),
            endDate.toISOString(),
            "All",
          ),
        ]);
        setPieStats(stats);
        setRvtTrips(rvt);
        setTaxiTrips(taxi);
        setTotalTrips(all);
      } catch (error) {
        console.error("Failed to fetch pie stats", error);
      } finally {
        setLoadingPie(false);
      }
    }

    fetchPieData();
    const interval = setInterval(fetchPieData, 120000);
    return () => clearInterval(interval);
  }, [pieFilter, customDate]);

  const pieData = [
    { name: "RVT", value: pieStats.rvt },
    { name: "Taxi", value: pieStats.taxi },
  ];

  const COLORS = ["var(--secondary-color)", "#e67e22"];

  return (
    <div style={{ marginTop: "2rem" }}>
      {/* Today's Trips Section */}
      <div className="card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                padding: "0.5rem",
                borderRadius: "0.5rem",
                backgroundColor: "#eff6ff",
                color: "var(--primary-color)",
              }}
            >
              <CalendarDaysIcon style={{ width: "24px", height: "24px" }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#111827" }}>
                {pieFilter === "today"
                  ? "Today's Overview"
                  : "Trips Distribution"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
                Total of <strong>{pieStats.total}</strong> trips in this period
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <select
              value={pieFilter}
              onChange={(e) => {
                setPieFilter(e.target.value as FilterType);
                setCustomDate("");
              }}
              className="form-select"
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="today">Today</option>
              {/* ... other options same as before ... */}
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last 1 Year</option>
              <option value="date">Specific Date</option>
              <option value="month">Specific Month</option>
              <option value="year">Specific Year</option>
            </select>

            {pieFilter === "date" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="form-input"
                style={{
                  padding: "0.4rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                }}
              />
            )}
            {pieFilter === "month" && (
              <input
                type="month"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="form-input"
                style={{
                  padding: "0.4rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                }}
              />
            )}
            {pieFilter === "year" && (
              <input
                type="number"
                placeholder="Year"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="form-input"
                style={{
                  padding: "0.4rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  width: "80px",
                }}
              />
            )}

            {pieFilter === "today" && (
              <Link
                href="/admin/trips?date="
                className="btn"
                style={{
                  fontSize: "0.875rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                }}
              >
                View Details
              </Link>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            alignItems: "stretch",
          }}
        >
          {/* Left Column: Stats Cards Grid */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {/* Total Trips Card */}
            <div
              onClick={() => setShowTotalModal(true)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.75rem",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              className="hover:scale-[1.01] hover:shadow-md hover:border-blue-300"
            >
              <div>
                <h4
                  style={{
                    margin: 0,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "#6b7280",
                    letterSpacing: "0.05em",
                  }}
                >
                  Total Trips
                </h4>
                <p
                  style={{
                    margin: "0.25rem 0 0",
                    fontSize: "1.875rem",
                    fontWeight: "bold",
                    color: "#3b82f6",
                  }}
                >
                  {loadingPie ? "..." : pieStats.total}
                </p>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#3b82f6",
                    fontWeight: "500",
                  }}
                >
                  Click to view details
                </span>
              </div>
              <div
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#eff6ff",
                  color: "#3b82f6",
                }}
              >
                <BriefcaseIcon style={{ width: "28px", height: "28px" }} />
              </div>
            </div>

            {/* RVT Trips Card (Clickable) */}
            <div
              onClick={() => {
                setShowRvtModal(true);
              }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.75rem",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              className="hover:scale-[1.01] hover:shadow-md hover:border-indigo-300"
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: "4px",
                  backgroundColor: "var(--secondary-color)",
                }}
              ></div>
              <div>
                <h4
                  style={{
                    margin: 0,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "#6b7280",
                    letterSpacing: "0.05em",
                  }}
                >
                  RVT Trips
                </h4>
                <p
                  style={{
                    margin: "0.25rem 0 0",
                    fontSize: "1.875rem",
                    fontWeight: "bold",
                    color: "var(--secondary-color)",
                  }}
                >
                  {loadingPie ? "..." : pieStats.rvt}
                </p>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--secondary-color)",
                    fontWeight: "500",
                  }}
                >
                  Click to view details
                </span>
              </div>
              <div
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#f5f3ff",
                  color: "var(--secondary-color)",
                }}
              >
                <TruckIcon style={{ width: "28px", height: "28px" }} />
              </div>
            </div>

            {/* Taxi Trips Card */}
            <div
              onClick={() => setShowTaxiModal(true)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.75rem",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              className="hover:scale-[1.01] hover:shadow-md hover:border-orange-300"
            >
              <div>
                <h4
                  style={{
                    margin: 0,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "#6b7280",
                    letterSpacing: "0.05em",
                  }}
                >
                  Taxi Trips
                </h4>
                <p
                  style={{
                    margin: "0.25rem 0 0",
                    fontSize: "1.875rem",
                    fontWeight: "bold",
                    color: "#e67e22",
                  }}
                >
                  {loadingPie ? "..." : pieStats.taxi}
                </p>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#e67e22",
                    fontWeight: "500",
                  }}
                >
                  Click to view details
                </span>
              </div>
              <div
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#fff7ed",
                  color: "#e67e22",
                }}
              >
                <CurrencyDollarIcon style={{ width: "28px", height: "28px" }} />
              </div>
            </div>
          </div>

          {/* Right Column: Pie Chart */}
          <div
            style={{
              height: "100%",
              minHeight: "300px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f9fafb",
              borderRadius: "1rem",
              padding: "1rem",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                  }: any) => {
                    const RADIAN = Math.PI / 180;
                    // Place label outside the chart
                    const radius = outerRadius + 20;
                    const angle = midAngle || 0;
                    const x = cx + radius * Math.cos(-angle * RADIAN);
                    const y = cy + radius * Math.sin(-angle * RADIAN);
                    const p = percent || 0;
                    return p > 0 ? (
                      <text
                        x={x}
                        y={y}
                        fill="#374151"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        style={{ fontSize: "14px", fontWeight: "600" }}
                      >
                        {`${(p * 100).toFixed(0)}%`}
                      </text>
                    ) : null;
                  }}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    padding: "0.75rem",
                  }}
                  itemStyle={{ fontSize: "0.875rem", fontWeight: "500" }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span
                      style={{
                        color: "#4b5563",
                        fontWeight: 500,
                        marginRight: "1rem",
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trends Section - Unchanged */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <h3 style={{ margin: 0 }}>Trips Trend</h3>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              backgroundColor: "#f0f0f0",
              padding: "0.25rem",
              borderRadius: "8px",
            }}
          >
            <button
              onClick={() => setTrendRange("7d")}
              className="btn"
              style={{
                padding: "0.25rem 0.75rem",
                fontSize: "0.875rem",
                backgroundColor: trendRange === "7d" ? "white" : "transparent",
                color: trendRange === "7d" ? "var(--primary-color)" : "#666",
                boxShadow:
                  trendRange === "7d" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                border: "none",
              }}
            >
              7 Days
            </button>
            <button
              onClick={() => setTrendRange("30d")}
              className="btn"
              style={{
                padding: "0.25rem 0.75rem",
                fontSize: "0.875rem",
                backgroundColor: trendRange === "30d" ? "white" : "transparent",
                color: trendRange === "30d" ? "var(--primary-color)" : "#666",
                boxShadow:
                  trendRange === "30d" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                border: "none",
              }}
            >
              30 Days
            </button>
            <button
              onClick={() => setTrendRange("1y")}
              className="btn"
              style={{
                padding: "0.25rem 0.75rem",
                fontSize: "0.875rem",
                backgroundColor: trendRange === "1y" ? "white" : "transparent",
                color: trendRange === "1y" ? "var(--primary-color)" : "#666",
                boxShadow:
                  trendRange === "1y" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                border: "none",
              }}
            >
              1 Year
            </button>
          </div>
        </div>

        <div style={{ height: "300px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            {trendRange === "1y" || trendRange === "30d" ? (
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--primary-color)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary-color)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eee"
                />
                <XAxis
                  dataKey={trendRange === "1y" ? "name" : "date"}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                  tickFormatter={(val) => {
                    if (trendRange === "1y") return val;
                    const d = new Date(val);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  labelFormatter={(label) => {
                    if (trendRange === "1y") return label;
                    return new Date(label).toLocaleDateString();
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary-color)"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            ) : (
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                    return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][
                      d.getDay()
                    ];
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "#f5f5f5" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  labelFormatter={(label) => new Date(label).toDateString()}
                />
                <Bar
                  dataKey="count"
                  fill="var(--primary-color)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
      <RvtTripsModal
        isOpen={showRvtModal}
        onClose={() => setShowRvtModal(false)}
        trips={rvtTrips}
        dateLabel={
          pieFilter === "today"
            ? new Date().toLocaleDateString()
            : pieFilter === "date" && customDate
              ? new Date(customDate).toLocaleDateString()
              : pieFilter === "month" && customDate
                ? customDate
                : pieFilter === "year" && customDate
                  ? customDate
                  : pieFilter === "7d"
                    ? "Last 7 Days"
                    : pieFilter === "30d"
                      ? "Last 30 Days"
                      : pieFilter === "1y"
                        ? "Last 1 Year"
                        : ""
        }
      />
      <TaxiTripsModal
        isOpen={showTaxiModal}
        onClose={() => setShowTaxiModal(false)}
        trips={taxiTrips}
        dateLabel={
          pieFilter === "today"
            ? new Date().toLocaleDateString()
            : pieFilter === "date" && customDate
              ? new Date(customDate).toLocaleDateString()
              : pieFilter === "month" && customDate
                ? customDate
                : pieFilter === "year" && customDate
                  ? customDate
                  : pieFilter === "7d"
                    ? "Last 7 Days"
                    : pieFilter === "30d"
                      ? "Last 30 Days"
                      : pieFilter === "1y"
                        ? "Last 1 Year"
                        : ""
        }
      />
      <TotalTripsModal
        isOpen={showTotalModal}
        onClose={() => setShowTotalModal(false)}
        trips={totalTrips}
        dateLabel={
          pieFilter === "today"
            ? new Date().toLocaleDateString()
            : pieFilter === "date" && customDate
              ? new Date(customDate).toLocaleDateString()
              : pieFilter === "month" && customDate
                ? customDate
                : pieFilter === "year" && customDate
                  ? customDate
                  : pieFilter === "7d"
                    ? "Last 7 Days"
                    : pieFilter === "30d"
                      ? "Last 30 Days"
                      : pieFilter === "1y"
                        ? "Last 1 Year"
                        : ""
        }
      />
      <RevenueCard />
      <InvoiceAnalytics />
      <TaxiAnalytics />
      <DieselAnalytics />
    </div>
  );
}
