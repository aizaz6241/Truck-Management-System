import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface VehicleTrendModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  vehicles: string[];
  loading: boolean;
  ownerName?: string;
  title: string;
  unit?: string;
}

const COLORS = [
  "#4f46e5", // Indigo
  "#059669", // Emerald
  "#d97706", // Amber
  "#e11d48", // Rose
  "#0891b2", // Cyan
  "#7c3aed", // Violet
  "#0d9488", // Teal
  "#c026d3", // Fuchsia
];

export default function VehicleTrendModal({
  isOpen,
  onClose,
  data,
  vehicles,
  loading,
  ownerName,
  title,
  unit = "",
}: VehicleTrendModalProps) {
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
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto z-50">
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
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 tex-left align-middle shadow-2xl transition-all border border-gray-100">
                <div className="flex justify-between items-start mb-8 pb-4 border-b border-gray-100">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                    {ownerName && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                          {ownerName}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:rotate-90 duration-300"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="h-[400px] w-full">
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : data.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <p>No data available for this period.</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#eee"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          tickFormatter={(val) => {
                            const d = new Date(val);
                            return `${d.getDate()}/${d.getMonth() + 1}`;
                          }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "12px",
                            border: "1px solid #f3f4f6",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            padding: "12px",
                          }}
                          itemStyle={{
                            fontSize: "12px",
                            color: "#374151",
                            fontWeight: 500,
                          }}
                          labelStyle={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginBottom: "8px",
                          }}
                          cursor={{
                            stroke: "#6366f1",
                            strokeWidth: 1,
                            strokeDasharray: "4 4",
                          }}
                          labelFormatter={(label) =>
                            new Date(label).toLocaleDateString("en-GB", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          }
                          formatter={(value: any) => [`${unit}${value}`, ""]}
                        />
                        <Legend />
                        {vehicles.map((vehicle, index) => (
                          <Line
                            key={vehicle}
                            type="monotone"
                            dataKey={vehicle}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
