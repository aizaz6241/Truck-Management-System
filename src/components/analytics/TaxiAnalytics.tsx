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
  getOwnerRevenueAnalytics,
  getOwnerDieselAnalytics,
  FilterType,
} from "@/actions/analytics";
import {
  UserCircleIcon,
  EyeIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import VehicleTrendModal from "./VehicleTrendModal";

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
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"trips" | "revenue" | "diesel">(
    "trips",
  );
  const [modalTitle, setModalTitle] = useState("");
  const [modalUnit, setModalUnit] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartVehicles, setChartVehicles] = useState<string[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);

  const handleOpenModal = async (type: "trips" | "revenue" | "diesel") => {
    if (!selectedOwnerId) return;

    setModalType(type);
    setIsModalOpen(true);
    setLoadingChart(true);
    setChartData([]);
    setChartVehicles([]);

    try {
      let data: { chartData: any[]; vehicles: string[] } = {
        chartData: [],
        vehicles: [],
      };

      if (type === "trips") {
        setModalTitle("Vehicle Wise Trips Trend");
        setModalUnit("");
        data = await getOwnerTripsAnalytics(
          selectedOwnerId,
          filterType,
          dateParam,
        );
      } else if (type === "revenue") {
        setModalTitle("Vehicle Wise Revenue Trend");
        setModalUnit("AED ");
        data = await getOwnerRevenueAnalytics(
          selectedOwnerId,
          filterType,
          dateParam,
        );
      } else if (type === "diesel") {
        setModalTitle("Vehicle Wise Diesel Consumption Trend");
        setModalUnit("AED ");
        data = await getOwnerDieselAnalytics(
          selectedOwnerId,
          filterType,
          dateParam,
        );
      }

      setChartData(data.chartData);
      setChartVehicles(data.vehicles);
    } catch (error) {
      console.error(`Failed to fetch ${type} trend`, error);
    } finally {
      setLoadingChart(false);
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

  const COLORS = ["var(--primary-color)", "#e5e7eb"]; // Owner, Others (Total - Owner)

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

    const filledData = data.filter((d) => d.value > 0);
    const chartData =
      filledData.length > 0 ? filledData : [{ name: "No Data", value: 1 }];
    const showEmpty = filledData.length === 0;

    // If no data
    if (totalValue === 0) {
      return (
        <div
          className="flex flex-col items-center justify-center bg-gray-50/50 rounded-xl border border-gray-200 min-h-[350px]"
          style={{ padding: "32px" }}
        >
          <div className="p-4 bg-gray-100 rounded-full mb-3">
            <ChartBarIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-sm font-medium text-gray-900 text-center mt-2">
            {title}
          </h4>
          <p className="text-gray-500 text-xs mt-1">No data available</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-md h-full">
        {/* Header */}
        <div
          className="flex w-full items-center justify-between border-b border-gray-100"
          style={{ padding: "24px" }}
        >
          <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
          {selectedOwnerId &&
            (title === "Trips Share" ||
              title === "Revenue Share" ||
              title === "Diesel Consumption") && (
              <button
                onClick={() => {
                  if (title === "Trips Share") handleOpenModal("trips");
                  else if (title === "Revenue Share")
                    handleOpenModal("revenue");
                  else if (title === "Diesel Consumption")
                    handleOpenModal("diesel");
                }}
                className="group relative p-1.5 rounded-md hover:bg-gray-50 text-gray-400 hover:text-indigo-600 transition-colors duration-200 focus:outline-none"
                title="View Vehicle Wise Trend"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            )}
        </div>

        {/* Chart Body */}
        <div
          className="flex-1 min-h-[300px] w-full relative"
          style={{ padding: "24px" }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium mb-1">
                Owner Share
              </p>
              <p className="text-3xl font-bold text-gray-800">
                {Math.round((ownerValue / totalValue) * 100)}%
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
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
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  padding: "8px 12px",
                }}
                itemStyle={{
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <div
          className="border-t border-gray-100 bg-gray-50/50 flex justify-between items-center"
          style={{ padding: "24px" }}
        >
          <span className="text-sm font-medium text-gray-500">Total</span>
          <span className="text-base font-bold text-gray-800">
            {unit}
            {totalValue.toLocaleString()}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8"
      style={{ padding: "32px" }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <UserCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 m-0 leading-tight">
              Taxi Analytics
            </h3>
            <p className="text-sm text-gray-500 m-0 font-medium">
              Owner Performance vs Fleet
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          {/* Owner Selector */}
          <div className="relative">
            <select
              value={selectedOwnerId || ""}
              onChange={(e) => setSelectedOwnerId(Number(e.target.value))}
              className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full py-2 pl-3 pr-8 min-w-[200px] shadow-sm cursor-pointer hover:border-gray-400 transition-colors"
              style={{ height: "38px" }}
            >
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block"></div>

          {/* Time Filter Reused */}
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as FilterType);
                  setDateParam("");
                }}
                className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full py-2 pl-3 pr-8 shadow-sm cursor-pointer hover:border-gray-400 transition-colors"
                style={{ height: "38px" }} // Match height with input
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
              <ChevronDownIcon className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {filterType === "date" && (
              <input
                type="date"
                value={dateParam}
                onChange={(e) => setDateParam(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 shadow-sm hover:border-gray-400 transition-colors"
                style={{ height: "38px" }}
              />
            )}
            {filterType === "month" && (
              <input
                type="month"
                value={dateParam}
                onChange={(e) => setDateParam(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 shadow-sm hover:border-gray-400 transition-colors"
                style={{ height: "38px" }}
              />
            )}
            {filterType === "year" && (
              <input
                type="number"
                placeholder="Year"
                value={dateParam}
                onChange={(e) => setDateParam(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-24 px-3 py-2 shadow-sm hover:border-gray-400 transition-colors"
                style={{ height: "38px" }}
              />
            )}
          </div>
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
        <VehicleTrendModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={chartData}
          vehicles={chartVehicles}
          loading={loadingChart}
          ownerName={owners.find((o) => o.id === selectedOwnerId)?.name}
          title={modalTitle}
          unit={modalUnit}
        />
      </div>
    </div>
  );
}
