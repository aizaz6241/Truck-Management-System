"use client";

import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface VehicleAnalyticsProps {
  vehicles: {
    id: number;
    number: string;
    trips: { date: Date | string }[];
  }[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
];

export default function VehicleAnalytics({ vehicles }: VehicleAnalyticsProps) {
  const [filterType, setFilterType] = useState<
    "all" | "7d" | "30d" | "date" | "month" | "year" | "range"
  >("all");
  const [customDate, setCustomDate] = useState("");
  const [customMonth, setCustomMonth] = useState("");
  const [customYear, setCustomYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | "all">(
    "all",
  );

  const filterTrips = (trips: { date: Date | string }[]) => {
    if (filterType === "all") return trips;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return trips.filter((t) => {
      const tripDate = new Date(t.date);
      tripDate.setHours(0, 0, 0, 0);

      switch (filterType) {
        case "7d": {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          return tripDate >= sevenDaysAgo && tripDate <= today;
        }
        case "30d": {
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(today.getDate() - 30);
          return tripDate >= thirtyDaysAgo && tripDate <= today;
        }
        case "date": {
          if (!customDate) return true;
          return (
            tripDate.getTime() === new Date(customDate).setHours(0, 0, 0, 0)
          );
        }
        case "month": {
          if (!customMonth) return true;
          const [year, month] = customMonth.split("-").map(Number);
          return (
            tripDate.getFullYear() === year && tripDate.getMonth() === month - 1
          );
        }
        case "year": {
          if (!customYear) return true;
          return tripDate.getFullYear().toString() === customYear;
        }
        case "range": {
          if (!startDate || !endDate) return true;
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(0, 0, 0, 0);
          return tripDate >= start && tripDate <= end;
        }
        default:
          return true;
      }
    });
  };

  // Pie Chart Data: Total Trips by Vehicle
  const pieData = useMemo(() => {
    return vehicles
      .map((v) => ({
        name: v.number,
        value: filterTrips(v.trips).length,
      }))
      .filter((d) => d.value > 0);
  }, [
    vehicles,
    filterType,
    customDate,
    customMonth,
    customYear,
    startDate,
    endDate,
  ]);

  // Line Chart Data: Dynamic Aggregation (Daily vs Monthly)
  const lineData = useMemo(() => {
    let filteredTrips: { date: Date | string }[] = [];

    if (selectedVehicleId === "all") {
      // Aggregate all trips
      vehicles.forEach((v) => {
        filteredTrips = [...filteredTrips, ...v.trips];
      });
    } else {
      const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
      if (vehicle) {
        filteredTrips = vehicle.trips;
      }
    }

    // Apply Date Filter
    filteredTrips = filterTrips(filteredTrips);

    // Determine Aggregation Type
    let aggregationType: "daily" | "monthly" = "monthly";

    if (["7d", "30d", "month", "date"].includes(filterType)) {
      aggregationType = "daily";
    } else if (filterType === "range") {
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // If range is 60 days or less, show daily
        if (diffDays <= 60) {
          aggregationType = "daily";
        }
      }
    }

    // Group Data
    const tripsByPeriod: Record<string, number> = {};

    filteredTrips.forEach((trip) => {
      const date = new Date(trip.date);
      let key = "";

      if (aggregationType === "daily") {
        // Format: YYYY-MM-DD for sorting/grouping, display can be formatted later
        key = date.toISOString().split("T")[0];
      } else {
        // Format: Mon YYYY
        key = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
      }

      tripsByPeriod[key] = (tripsByPeriod[key] || 0) + 1;
    });

    return Object.keys(tripsByPeriod)
      .map((key) => {
        let timestamp = 0;
        let displayName = key;

        if (aggregationType === "daily") {
          const [year, month, day] = key.split("-").map(Number);
          const dateObj = new Date(year, month - 1, day);
          timestamp = dateObj.getTime();
          displayName = dateObj.toLocaleDateString("default", {
            month: "short",
            day: "numeric",
          }); // e.g., "Oct 25"
        } else {
          const [month, year] = key.split(" ");
          const dateObj = new Date(`${month} 1, ${year}`);
          timestamp = dateObj.getTime();
          displayName = key;
        }

        return {
          name: displayName, // Display on X-Axis
          originalKey: key, // For debugging/sorting consistency if needed
          trips: tripsByPeriod[key],
          timestamp: timestamp,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [
    vehicles,
    selectedVehicleId,
    filterType,
    customDate,
    customMonth,
    customYear,
    startDate,
    endDate,
  ]);

  return (
    <div style={{ marginBottom: "2rem" }}>
      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: "1rem",
          backgroundColor: "white",
          borderRadius: "0.5rem",
          marginBottom: "1.5rem",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ fontWeight: 500, color: "#374151" }}>Period:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            style={{
              padding: "0.5rem",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
            }}
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="date">Specific Date</option>
            <option value="month">Specific Month</option>
            <option value="year">Specific Year</option>
            <option value="range">Date Range</option>
          </select>
        </div>

        {filterType === "date" && (
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            style={{
              padding: "0.4rem",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
            }}
          />
        )}

        {filterType === "month" && (
          <input
            type="month"
            value={customMonth}
            onChange={(e) => setCustomMonth(e.target.value)}
            style={{
              padding: "0.4rem",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
            }}
          />
        )}

        {filterType === "year" && (
          <input
            type="number"
            placeholder="Year (YYYY)"
            value={customYear}
            onChange={(e) => setCustomYear(e.target.value)}
            style={{
              padding: "0.4rem",
              borderRadius: "0.375rem",
              border: "1px solid #d1d5db",
            }}
          />
        )}

        {filterType === "range" && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: "0.4rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
              }}
            />
            <span style={{ color: "#6b7280" }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: "0.4rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
              }}
            />
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "2rem",
        }}
      >
        {/* Pie Chart Section */}
        {/* Pie Chart Section - Flex Layout for Side Legend */}
        <div
          className="card"
          style={{
            padding: "1.5rem",
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              marginBottom: "1rem",
              fontSize: "1.25rem",
              color: "#1f2937",
            }}
          >
            Fleet Trip Distribution
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 300,
            }}
          >
            {/* Chart Area */}
            <div style={{ width: "60%", height: "100%" }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) =>
                      `${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | undefined, name: any) => [
                      `${value ?? 0} trips`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend Area */}
            <div
              style={{
                width: "40%",
                paddingLeft: "1rem",
                overflowY: "auto",
                maxHeight: "280px",
              }}
            >
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {pieData.map((entry, index) => (
                  <li
                    key={`legend-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                      fontSize: "0.9rem",
                      color: "#374151",
                    }}
                  >
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: COLORS[index % COLORS.length],
                        borderRadius: "50%",
                        marginRight: "0.75rem",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontWeight: 500 }}>{entry.name}:</span>
                    <span style={{ marginLeft: "0.5rem", color: "#6b7280" }}>
                      {entry.value} Trips
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Line Chart Section */}
        <div
          className="card"
          style={{
            padding: "1.5rem",
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#1f2937" }}>
              Performance Over Time
            </h3>
            <select
              value={selectedVehicleId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedVehicleId(val === "all" ? "all" : Number(val));
              }}
              style={{
                padding: "0.5rem",
                borderRadius: "0.375rem",
                borderColor: "#d1d5db",
                fontSize: "0.875rem",
              }}
            >
              <option value="all">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.number}
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart
                data={lineData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="trips"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
