"use client";

import { useEffect, useState } from "react";
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  getInvoiceStats,
  getContractorStats,
  FilterType,
} from "@/actions/analytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ContractorPieChartModal from "./ContractorPieChartModal";
import ContractorPaymentProfile from "./ContractorPaymentProfile";

export default function InvoiceAnalytics() {
  const [filter, setFilter] = useState<FilterType>("30d");
  const [customDate, setCustomDate] = useState("");
  const [stats, setStats] = useState({
    totalInvoiced: 0,
    totalReceived: 0,
    totalRemaining: 0,
    trend: [] as any[],
  });
  const [contractorStats, setContractorStats] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<
    "total" | "received" | "remaining"
  >("total");
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

        const [mainStats, cStats] = await Promise.all([
          getInvoiceStats(filter, customDate),
          getContractorStats(filter, customDate),
        ]);

        setStats(mainStats);
        setContractorStats(cStats);
      } catch (error) {
        console.error("Failed to fetch invoice stats", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 120000);
    return () => clearInterval(interval);
  }, [filter, customDate]);

  const formatCurrency = (val: number) => {
    return `AED ${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatCompact = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val;
  };

  const openModal = (type: "total" | "received" | "remaining") => {
    setModalType(type);
    setShowModal(true);
  };

  return (
    <div className="card" style={{ marginTop: "2rem", padding: "1.5rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              padding: "0.5rem",
              borderRadius: "0.5rem",
              backgroundColor: "#e0e7ff",
              color: "#4338ca",
            }}
          >
            <CurrencyDollarIcon style={{ height: "24px", width: "24px" }} />
          </div>
          <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
            Invoice Payment Analytics
          </h3>
        </div>

        {/* Filters */}
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

      {/* Overview Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Total Invoiced */}
        <div
          onClick={() => openModal("total")}
          style={{
            padding: "1.5rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "0.75rem",
            borderLeft: "4px solid #4f46e5",
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
          className="hover:shadow-md hover:scale-[1.02]"
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              color: "#6b7280",
              fontWeight: "600",
              textTransform: "uppercase",
            }}
          >
            Total Invoiced
          </p>
          <p
            style={{
              margin: "0.5rem 0 0",
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#1f2937",
            }}
          >
            {isLoading ? "..." : formatCurrency(stats.totalInvoiced)}
          </p>
        </div>

        {/* Received */}
        <div
          onClick={() => openModal("received")}
          style={{
            padding: "1.5rem",
            backgroundColor: "#f0fdf4",
            borderRadius: "0.75rem",
            borderLeft: "4px solid #16a34a",
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
          className="hover:shadow-md hover:scale-[1.02]"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  color: "#166534",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Received Amount
              </p>
              <p
                style={{
                  margin: "0.5rem 0 0",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#16a34a",
                }}
              >
                {isLoading ? "..." : formatCurrency(stats.totalReceived)}
              </p>
            </div>
            <CheckCircleIcon style={{ width: "24px", color: "#16a34a" }} />
          </div>
        </div>

        {/* Remaining */}
        <div
          onClick={() => openModal("remaining")}
          style={{
            padding: "1.5rem",
            backgroundColor: "#fff7ed",
            borderRadius: "0.75rem",
            borderLeft: "4px solid #ea580c",
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
          className="hover:shadow-md hover:scale-[1.02]"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  color: "#9a3412",
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                Remaining Pending
              </p>
              <p
                style={{
                  margin: "0.5rem 0 0",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#ea580c",
                }}
              >
                {isLoading ? "..." : formatCurrency(stats.totalRemaining)}
              </p>
            </div>
            <ExclamationCircleIcon
              style={{ width: "24px", color: "#ea580c" }}
            />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: "400px", width: "100%", marginTop: "1rem" }}>
        <h4 style={{ margin: "0 0 1rem", color: "#6b7280" }}>Payment Trends</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stats.trend}
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
              tickFormatter={(val) => String(formatCompact(Number(val)))}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              formatter={(value: any) => [formatCurrency(Number(value)), ""]}
              labelFormatter={(label) => new Date(label).toDateString()}
              cursor={{ fill: "transparent" }}
            />
            <Legend verticalAlign="top" height={36} />
            <Bar
              dataKey="total"
              name="Total Invoiced"
              fill="#4f46e5"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar
              dataKey="received"
              name="Received"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ContractorPaymentProfile
        contractorStats={contractorStats}
        filter={filter}
        customDate={customDate}
      />

      <ContractorPieChartModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={contractorStats}
        type={modalType}
      />
    </div>
  );
}
