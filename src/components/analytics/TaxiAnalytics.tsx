"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getTaxiAnalytics,
  getOwnerTripsAnalytics,
  FilterType,
} from "@/actions/analytics";
import { UserCircleIcon, EyeIcon } from "@heroicons/react/24/outline";
import TripsTrendModal from "./TripsTrendModal";

export default function TaxiAnalytics() {
  const [filterType, setFilterType] = useState<FilterType>("today");
  const [dateParam, setDateParam] = useState("");
  const [selectedOwnerId, setSelectedOwnerId] = useState<number | null>(null);
  const [owners, setOwners] = useState<any[]>([]);
  const [stats, setStats] = useState({
    trips: { total: 0, owner: 0 },
    revenue: { total: 0, owner: 0 },
    diesel: { total: 0, owner: 0 },
  });
  const [loading, setLoading] = useState(false);

  // Trips Modal State
  const [isTripsModalOpen, setIsTripsModalOpen] = useState(false);
  const [tripsData, setTripsData] = useState<any[]>([]);
  const [tripVehicles, setTripVehicles] = useState<string[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  const handleOpenTripsModal = async () => {
    if (!selectedOwnerId) return;

    setIsTripsModalOpen(true);
    setLoadingTrips(true);
    try {
      const { chartData, vehicles } = await getOwnerTripsAnalytics(
        selectedOwnerId,
        filterType,
        dateParam,
      );
      setTripsData(chartData);
      setTripVehicles(vehicles);
    } catch (error) {
      console.error("Failed to fetch trips trend", error);
    } finally {
      setLoadingTrips(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getTaxiAnalytics(
          filterType,
          dateParam,
          selectedOwnerId || undefined,
        );
        setOwners(data.owners);
        setStats({
          trips: data.trips,
          revenue: data.revenue,
          diesel: data.diesel,
        });

        // Auto-select first owner if none selected and owners exist
        if (!selectedOwnerId && data.owners.length > 0) {
          setSelectedOwnerId(data.owners[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch taxi stats", error);
      } finally {
        setLoading(false);
      }
    }

    if (
      (filterType === "date" ||
        filterType === "month" ||
        filterType === "year") &&
      !dateParam
    ) {
      // Wait for date input
    } else {
      fetchData();
    }
  }, [filterType, dateParam, selectedOwnerId]);

  const COLORS = ["#0088FE", "#FFBB28"]; // Owner, Others (Total - Owner)

  const renderPieChart = (
    title: string,
    ownerValue: number,
    totalValue: number,
    unit: string = "",
  ) => {
    const othersValue = Math.max(0, totalValue - ownerValue);
    const data = [
      { name: "Selected Owner", value: ownerValue },
      { name: "Other Taxis", value: othersValue },
    ];

    // If no data
    if (totalValue === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-gray-400">No data available</p>
        </div>
      );
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2 justify-center">
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide text-center">
            {title}
          </h4>
          {title === "Trips Share" && selectedOwnerId && (
            <button
              onClick={handleOpenTripsModal}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
              title="View Vehicle Wise Trend"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [
                  `${unit}${(value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                  "",
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-2">
          <p className="text-xs text-gray-500">
            Total: {unit}
            {totalValue.toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="card mt-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <UserCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 m-0">
              Taxi Analytics
            </h3>
            <p className="text-sm text-gray-500 m-0">
              Owner Performance vs Fleet
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          {/* Owner Selector */}
          <select
            value={selectedOwnerId || ""}
            onChange={(e) => setSelectedOwnerId(Number(e.target.value))}
            className="form-select border-gray-300 rounded-md text-sm py-1.5"
            style={{ maxWidth: "200px" }}
          >
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>

          <div className="w-px h-6 bg-gray-300 mx-2 hidden sm:block"></div>

          {/* Time Filter Reused */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as FilterType);
              setDateParam("");
            }}
            className="form-select border-gray-300 rounded-md text-sm py-1.5"
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

          {filterType === "date" && (
            <input
              type="date"
              value={dateParam}
              onChange={(e) => setDateParam(e.target.value)}
              className="form-input text-sm py-1.5"
            />
          )}
          {filterType === "month" && (
            <input
              type="month"
              value={dateParam}
              onChange={(e) => setDateParam(e.target.value)}
              className="form-input text-sm py-1.5"
            />
          )}
          {filterType === "year" && (
            <input
              type="number"
              placeholder="Year"
              value={dateParam}
              onChange={(e) => setDateParam(e.target.value)}
              className="form-input text-sm py-1.5 w-24"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderPieChart("Trips Share", stats.trips.owner, stats.trips.total)}
        {renderPieChart(
          "Revenue Share",
          stats.revenue.owner,
          stats.revenue.total,
          "AED ",
        )}
        {renderPieChart(
          "Diesel Consumption",
          stats.diesel.owner,
          stats.diesel.total,
          "AED ",
        )}
        <TripsTrendModal
          isOpen={isTripsModalOpen}
          onClose={() => setIsTripsModalOpen(false)}
          data={tripsData}
          vehicles={tripVehicles}
          loading={loadingTrips}
          ownerName={owners.find((o) => o.id === selectedOwnerId)?.name}
        />
      </div>
    </div>
  );
}
