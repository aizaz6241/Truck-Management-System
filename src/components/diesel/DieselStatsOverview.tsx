"use client";

import { useState } from "react";
import { BeakerIcon, BanknotesIcon } from "@heroicons/react/24/solid";
import FuelConsumptionModal from "./FuelConsumptionModal";

interface DieselStatsOverviewProps {
  stats: {
    totalLiters: number;
    totalCost: number;
  };
  records: any[];
}

export default function DieselStatsOverview({
  stats,
  records,
}: DieselStatsOverviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate breakdown for the modal
  const litersRVT = records
    .filter((r) => r.vehicle.ownership === "RVT")
    .reduce((sum, r) => sum + r.liters, 0);

  const litersTaxi = records
    .filter((r) => r.vehicle.ownership === "Taxi")
    .reduce((sum, r) => sum + r.liters, 0);

  // Handle case where filters on the main list might affect `records`.
  // Ideally, `records` passed here should be the full dataset if we want global stats,
  // OR the filtered dataset if we want stats to reflect filters.
  // Based on "DieselPage", `records` is the initial full fetch.

  const chartData = [
    { name: "RVT Vehicles", value: litersRVT, color: "#4f46e5" }, // Indigo
    { name: "Taxi Vehicles", value: litersTaxi, color: "#db2777" }, // Pink
  ];

  return (
    <>
      <div className="diesel-stats-grid">
        {/* Total Consumption Card - Clickable */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="diesel-stat-card group cursor-pointer hover:border-amber-200 hover:bg-amber-50/30 transition-all"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="diesel-stat-label amber">Total Consumption</p>
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity">
                VIEW DETAILS
              </span>
            </div>
            <div className="diesel-stat-value-group">
              <h2 className="diesel-stat-value">
                {stats.totalLiters?.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </h2>
              <span className="diesel-stat-unit">Liters</span>
            </div>
          </div>
          <div className="diesel-icon-box amber diesel-icon-hover group-hover:scale-110 duration-300">
            <BeakerIcon className="diesel-icon" />
          </div>
        </div>

        {/* Total Cost Card - Static */}
        <div className="diesel-stat-card group">
          <div>
            <p className="diesel-stat-label emerald">Total Cost</p>
            <div className="diesel-stat-value-group">
              <span className="text-2xl text-gray-400 font-bold mr-1">AED</span>
              <h2 className="diesel-stat-value">
                {stats.totalCost?.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </h2>
            </div>
          </div>
          <div className="diesel-icon-box emerald diesel-icon-hover">
            <BanknotesIcon className="diesel-icon" />
          </div>
        </div>
      </div>

      <FuelConsumptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={chartData}
        totalLiters={stats.totalLiters}
      />
    </>
  );
}
