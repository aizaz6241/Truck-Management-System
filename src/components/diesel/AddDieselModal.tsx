"use client";

import { useState, useTransition, useEffect } from "react";
import { addDieselRecord, updateDieselRecord } from "@/actions/diesel";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface AddDieselModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: any[];
  drivers: any[];
  onSuccess: (record: any) => void;
  initialData?: any;
}

export default function AddDieselModal({
  isOpen,
  onClose,
  vehicles,
  drivers,
  onSuccess,
  initialData,
}: AddDieselModalProps) {
  const [isPending, startTransition] = useTransition();
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [liters, setLiters] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");
  const [odometer, setOdometer] = useState("");

  useEffect(() => {
    if (isOpen && initialData) {
      setVehicleId(initialData.vehicleId.toString());
      setDriverId(initialData.driverId ? initialData.driverId.toString() : "");
      setDate(new Date(initialData.date).toISOString().split("T")[0]);
      setLiters(initialData.liters.toString());
      setPricePerLiter(initialData.pricePerLiter.toString());
      setOdometer(initialData.odometer ? initialData.odometer.toString() : "");
    } else if (isOpen && !initialData) {
      setVehicleId("");
      setDriverId("");
      setDate(new Date().toISOString().split("T")[0]);
      setLiters("");
      setPricePerLiter("");
      setOdometer("");
    }
  }, [isOpen, initialData]);

  const calculateTotal = () => {
    const l = parseFloat(liters) || 0;
    const p = parseFloat(pricePerLiter) || 0;
    return (l * p).toFixed(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !liters || !pricePerLiter) return;

    startTransition(async () => {
      const payload = {
        vehicleId: parseInt(vehicleId),
        driverId: driverId ? parseInt(driverId) : undefined,
        date: new Date(date),
        liters: parseFloat(liters),
        pricePerLiter: parseFloat(pricePerLiter),
        totalAmount: parseFloat(calculateTotal()),
        odometer: odometer ? parseFloat(odometer) : undefined,
      };

      let res;
      if (initialData) {
        res = await updateDieselRecord(initialData.id, payload);
      } else {
        res = await addDieselRecord(payload);
      }

      if (res.success && res.data) {
        const vehicle = vehicles.find((v) => v.id === parseInt(vehicleId));
        const driver = drivers.find((d) => d.id === parseInt(driverId));

        const fullRecord = {
          ...res.data,
          vehicle,
          driver,
        };

        onSuccess(fullRecord);
        onClose();
      } else {
        alert(initialData ? "Failed to update record" : "Failed to add record");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-100">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {initialData ? "Edit Diesel Record" : "Add New Record"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Enter fuel consumption details below
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-5">
            {/* Row 1: Date & Vehicle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-sm bg-gray-50/50 hover:bg-white focus:bg-white"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Vehicle
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all appearance-none bg-gray-50/50 hover:bg-white focus:bg-white text-sm"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  required
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.number}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Driver & Odometer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Driver{" "}
                  <span className="text-gray-400 font-normal lowercase">
                    (optional)
                  </span>
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all appearance-none bg-gray-50/50 hover:bg-white focus:bg-white text-sm"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                >
                  <option value="">Select Driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Odometer{" "}
                  <span className="text-gray-400 font-normal lowercase">
                    (optional)
                  </span>
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-sm bg-gray-50/50 hover:bg-white focus:bg-white placeholder-gray-400"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  placeholder="Ex: 50000"
                />
              </div>
            </div>

            {/* Calculations Section */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Liters
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-sm bg-white font-mono"
                      value={liters}
                      onChange={(e) => setLiters(e.target.value)}
                      required
                      placeholder="0.00"
                    />
                    <span className="absolute right-3.5 top-2.5 text-gray-400 text-xs font-medium">
                      L
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Price / Liter
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-400 text-xs font-medium">
                      AED
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-sm bg-white font-mono"
                      value={pricePerLiter}
                      onChange={(e) => setPricePerLiter(e.target.value)}
                      required
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-gray-200/50 mt-2">
                <span className="text-sm font-semibold text-gray-600">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                  <span className="text-base text-gray-400 font-normal mr-1">
                    AED
                  </span>
                  {calculateTotal()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 hover:shadow-gray-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : initialData ? (
                "Update Record"
              ) : (
                "Save Record"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
