"use client";

import { useState, useTransition, useEffect } from "react";
import {
  addDieselRecord,
  updateDieselRecord,
  addDieselRecords,
} from "@/actions/diesel";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import styles from "./AddDieselModal.module.css";
import { useLanguage } from "../LanguageProvider";

interface DieselRow {
  id: string; // Dynamic ID for React keys
  vehicleId: string;
  driverId: string;
  liters: string;
  odometer: string;
}

interface AddDieselModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: any[];
  drivers: any[];
  onSuccess: (records: any | any[]) => void;
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
  const { t, isRTL } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [rows, setRows] = useState<DieselRow[]>([
    {
      id: Math.random().toString(),
      vehicleId: "",
      driverId: "",
      liters: "",
      odometer: "",
    },
  ]);

  useEffect(() => {
    if (isOpen && initialData) {
      setDate(new Date(initialData.date).toISOString().split("T")[0]);
      setRows([
        {
          id: initialData.id.toString(),
          vehicleId: initialData.vehicleId.toString(),
          driverId: initialData.driverId ? initialData.driverId.toString() : "",
          liters: initialData.liters.toString(),
          odometer: initialData.odometer ? initialData.odometer.toString() : "",
        },
      ]);
    } else if (isOpen && !initialData) {
      setDate(new Date().toISOString().split("T")[0]);
      setRows([
        {
          id: Math.random().toString(),
          vehicleId: "",
          driverId: "",
          liters: "",
          odometer: "",
        },
      ]);
    }
  }, [isOpen, initialData]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        id: Math.random().toString(),
        vehicleId: "",
        driverId: "",
        liters: "",
        odometer: "",
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const handleRowChange = (
    id: string,
    field: keyof DieselRow,
    value: string,
  ) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rows.some((row) => !row.vehicleId || !row.liters)) {
      alert("Please fill in vehicle and liters for all rows.");
      return;
    }

    startTransition(async () => {
      if (initialData) {
        // Single update
        const payload = {
          vehicleId: parseInt(rows[0].vehicleId),
          driverId: rows[0].driverId ? parseInt(rows[0].driverId) : undefined,
          date: new Date(date),
          liters: parseFloat(rows[0].liters),
          pricePerLiter: 0, // Requested to remove price input, using 0 as fallback
          totalAmount: 0,
          odometer: rows[0].odometer ? parseFloat(rows[0].odometer) : undefined,
        };
        const res = await updateDieselRecord(initialData.id, payload);
        if (res.success && res.data) {
          const vehicle = vehicles.find(
            (v) => v.id === parseInt(rows[0].vehicleId),
          );
          const driver = drivers.find(
            (d) => d.id === parseInt(rows[0].driverId),
          );
          onSuccess({ ...res.data, vehicle, driver });
          onClose();
        } else {
          alert(res.error || "Failed to update record");
        }
      } else {
        // Batch add
        const records = rows.map((row) => ({
          vehicleId: parseInt(row.vehicleId),
          driverId: row.driverId ? parseInt(row.driverId) : undefined,
          date: new Date(date),
          liters: parseFloat(row.liters),
          pricePerLiter: 0, // Requested to remove price input
          totalAmount: 0,
          odometer: row.odometer ? parseFloat(row.odometer) : undefined,
        }));
        const res = await addDieselRecords(records);
        if (res.success && res.data) {
          onSuccess(res.data);
          onClose();
        } else {
          alert(res.error || "Failed to add records");
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      style={{ direction: isRTL ? "rtl" : "ltr" }}
    >
      <div
        className={`${styles.modal} ${!initialData ? styles.modalBatch : ""}`}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2>{initialData ? t("diesel.edit") : t("diesel.new")}</h2>
            <span className={styles.tag}>{t("diesel.fuelManagement")}</span>
          </div>
          <button
            onClick={onClose}
            className={styles.closeButton}
            type="button"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldsContainer}>
            {/* Single Date Section */}
            <div className={styles.batchDateSection}>
              <div className={styles.field}>
                <label className={styles.label}>{t("diesel.date")}</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="date"
                    className={styles.input}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Rows Section */}
            <div className={styles.rowsScrollArea}>
              {rows.map((row, index) => (
                <div key={row.id} className={styles.batchRow}>
                  <div className={styles.rowHeader}>
                    <span className={styles.rowNumber}>
                      {t("diesel.vehicle")} {index + 1}
                    </span>
                    {!initialData && rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className={styles.btnRemoveRow}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className={styles.rowGrid}>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        {t("diesel.vehicle")}
                      </label>
                      <select
                        className={styles.select}
                        value={row.vehicleId}
                        onChange={(e) =>
                          handleRowChange(row.id, "vehicleId", e.target.value)
                        }
                        required
                      >
                        <option value="">{t("trip.selectVehicle")}</option>
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.number}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>
                        {t("diesel.driver")}
                      </label>
                      <select
                        className={styles.select}
                        value={row.driverId}
                        onChange={(e) =>
                          handleRowChange(row.id, "driverId", e.target.value)
                        }
                      >
                        <option value="">{t("diesel.selectDriver")}</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>
                        {t("diesel.volume")}
                      </label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="number"
                          step="0.01"
                          className={styles.input}
                          value={row.liters}
                          onChange={(e) =>
                            handleRowChange(row.id, "liters", e.target.value)
                          }
                          required
                          placeholder="0.00"
                        />
                        <span className={styles.suffix}>
                          {t("diesel.liters")}
                        </span>
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>
                        {t("diesel.odometer")}
                      </label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="number"
                          className={styles.input}
                          value={row.odometer}
                          onChange={(e) =>
                            handleRowChange(row.id, "odometer", e.target.value)
                          }
                          placeholder="KM"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!initialData && (
              <button
                type="button"
                onClick={handleAddRow}
                className={styles.btnAddRow}
              >
                <PlusIcon className="w-5 h-5" />
                <span>
                  {t("diesel.addAnotherVehicle") || "Add Another Vehicle"}
                </span>
              </button>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.btnCancel}
              disabled={isPending}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  <span>{t("diesel.processing")}</span>
                </>
              ) : initialData ? (
                t("diesel.edit")
              ) : (
                t("common.submit")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
