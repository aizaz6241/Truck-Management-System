"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface FuelConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { name: string; value: number; color: string }[];
  totalLiters: number;
}

export default function FuelConsumptionModal({
  isOpen,
  onClose,
  data,
  totalLiters,
}: FuelConsumptionModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all border border-gray-100 ring-1 ring-black/5">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-bold leading-6 text-gray-900"
                    >
                      Fuel Breakdown
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mt-1">
                      Consumption by vehicle ownership
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="h-[300px] w-full relative">
                  {/* Absolute center text for donut chart effect */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Total
                    </span>
                    <span className="text-2xl font-black text-gray-900">
                      {(totalLiters / 1000).toFixed(1)}k
                    </span>
                  </div>

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        cornerRadius={6} // Rounded chart segments for modern look
                      >
                        {data.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="white"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "1rem",
                          border: "none",
                          boxShadow:
                            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.1)",
                          padding: "0.75rem 1rem",
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                        }}
                        itemStyle={{
                          fontWeight: 600,
                          color: "#374151",
                        }}
                        formatter={(value: number | undefined) => [
                          `${(value || 0).toLocaleString()} L`,
                          "Volume",
                        ]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ paddingTop: "1rem" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Total Consumption
                  </p>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <p className="text-3xl font-black text-gray-900">
                      {totalLiters.toLocaleString()}
                    </p>
                    <span className="text-base font-bold text-gray-400">
                      Liters
                    </span>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
