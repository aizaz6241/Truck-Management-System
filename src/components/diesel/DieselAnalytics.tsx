"use client";

import { useEffect, useState } from "react";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Droplet } from "lucide-react";
import { getDieselAnalytics, FilterType } from "@/actions/analytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// Since Lucide React isn't fully integrated maybe, reusing icons or SVG if needed.
// TruckIcon usage confirms we have HeroIcons or Lucide available.

export default function DieselAnalytics() {
  const [filter, setFilter] = useState<FilterType>("30d");
  const [customDate, setCustomDate] = useState("");
  const [stats, setStats] = useState({
    totalLiters: 0,
    totalCost: 0,
    trend: [] as any[],
    vehicleStats: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        if (
          (filter === "date" || filter === "month" || filter === "year") &&
          !customDate
        ) {
          setIsLoading(false);
          return;
        }

        const data = await getDieselAnalytics(filter, customDate);
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch diesel stats", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [filter, customDate]);

  const formatCurrency = (val: number) => {
    return `AED ${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="diesel-analytics-container">
      {/* Header */}
      <div className="diesel-analytics-header">
        <div className="diesel-analytics-title-group">
          <div className="diesel-analytics-icon-wrapper">
            <Droplet className="w-6 h-6" />
          </div>
          <h3 className="diesel-analytics-title">Diesel Analytics</h3>
        </div>

        {/* Filters */}
        <div className="diesel-filter-group">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as FilterType);
              setCustomDate("");
            }}
            className="form-select"
            style={{ minWidth: "140px" }}
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last 1 Year</option>
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
              style={{ width: "auto" }}
            />
          )}
          {filter === "month" && (
            <input
              type="month"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="form-input"
              style={{ width: "auto" }}
            />
          )}
          {filter === "year" && (
            <input
              type="number"
              placeholder="Year"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="form-input"
              style={{ width: "100px" }}
            />
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="diesel-analytics-overview">
        <div className="diesel-overview-card amber">
          <p className="diesel-overview-label amber">
            Total Liters Consumption
          </p>
          <p className="diesel-overview-value amber">
            {isLoading ? "..." : stats.totalLiters.toFixed(2)} L
          </p>
        </div>

        <div className="diesel-overview-card emerald">
          <p className="diesel-overview-label emerald">Total Diesel Cost</p>
          <p className="diesel-overview-value emerald">
            {isLoading ? "..." : formatCurrency(stats.totalCost)}
          </p>
        </div>
      </div>

      <div className="diesel-charts-container">
        {/* Trend Chart */}
        <div className="diesel-chart-box">
          <h4 className="diesel-chart-title">Consumption Trend (Liters)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.trend}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorLiters" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#eee"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                labelFormatter={(label) => new Date(label).toDateString()}
              />
              <Area
                type="monotone"
                dataKey="liters"
                stroke="#d97706"
                fillOpacity={1}
                fill="url(#colorLiters)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle Wise Chart */}
        <div className="diesel-chart-box">
          <h4 className="diesel-chart-title">Vehicle Wise Consumption</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={stats.vehicleStats}
              margin={{ top: 0, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#eee"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="vehicle"
                type="category"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                width={80}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Legend />
              <Bar
                dataKey="liters"
                name="Liters"
                fill="#d97706"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
