"use client";

import { useState, useTransition, useEffect } from "react";
import { addDieselRecord, updateDieselRecord } from "@/actions/diesel";
import { XMarkIcon } from "@heroicons/react/24/outline";
import styles from "./AddDieselModal.module.css";
import { useLanguage } from "../LanguageProvider";

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
  const { t, isRTL } = useLanguage();
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
        alert(
          res.error ||
            (initialData ? "Failed to update record" : "Failed to add record"),
        );
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      style={{ direction: isRTL ? "rtl" : "ltr" }}
    >
      <div className={styles.modal}>
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
            {/* Row 1: Date & Vehicle */}
            <div className={styles.row}>
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

              <div className={styles.field}>
                <label className={styles.label}>{t("diesel.vehicle")}</label>
                <div className={styles.inputWrapper}>
                  <select
                    className={styles.select}
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    required
                  >
                    <option value="">{t("trip.selectVehicle")}</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.number}
                      </option>
                    ))}
                  </select>
                  <div
                    className={styles.selectIcon}
                    style={isRTL ? { right: "auto", left: "1rem" } : {}}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Driver & Odometer */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>
                  {t("diesel.driver")}{" "}
                  <span className={styles.optional}>
                    {t("diesel.optional")}
                  </span>
                </label>
                <div className={styles.inputWrapper}>
                  {drivers.length === 1 ? (
                    <input
                      type="text"
                      className={`${styles.input} ${styles.readOnly}`}
                      value={drivers[0].name}
                      readOnly
                      disabled
                      style={{
                        backgroundColor: "#f3f4f6",
                        color: "#6b7280",
                        cursor: "not-allowed",
                      }}
                    />
                  ) : (
                    <>
                      <select
                        className={styles.select}
                        value={driverId}
                        onChange={(e) => setDriverId(e.target.value)}
                      >
                        <option value="">{t("diesel.selectDriver")}</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <div
                        className={styles.selectIcon}
                        style={isRTL ? { right: "auto", left: "1rem" } : {}}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fillRule="evenodd"
                            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                          />
                        </svg>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>
                  {t("diesel.odometer")}{" "}
                  <span className={styles.optional}>
                    {t("diesel.optional")}
                  </span>
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="number"
                    className={styles.input}
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    placeholder={t("diesel.odometerPlaceholder")}
                  />
                  <div
                    className={styles.suffix}
                    style={isRTL ? { right: "auto", left: "1rem" } : {}}
                  >
                    {t("diesel.km")}
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations Section */}
            <div className={styles.calcCard}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>{t("diesel.volume")}</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      step="0.01"
                      className={styles.input}
                      value={liters}
                      onChange={(e) => setLiters(e.target.value)}
                      required
                      placeholder="0.00"
                    />
                    <span
                      className={styles.suffix}
                      style={isRTL ? { right: "auto", left: "1rem" } : {}}
                    >
                      {t("diesel.liters")}
                    </span>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t("diesel.rate")}</label>
                  <div className={styles.inputWrapper}>
                    <span
                      className={styles.prefix}
                      style={isRTL ? { left: "auto", right: "1rem" } : {}}
                    >
                      {t("diesel.currency")}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      className={`${styles.input} ${styles.inputWithPrefix}`}
                      style={
                        isRTL
                          ? { paddingLeft: "1rem", paddingRight: "3rem" }
                          : {}
                      }
                      value={pricePerLiter}
                      onChange={(e) => setPricePerLiter(e.target.value)}
                      required
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.totalRow}>
                <div className={styles.totalLabel}>
                  <span className={styles.totalTitle}>{t("diesel.total")}</span>
                  <span className={styles.totalSubtitle}>
                    {t("diesel.autocalc")}
                  </span>
                </div>
                <div className={styles.totalValueBox}>
                  <span className={styles.currency}>
                    {t("diesel.currency")}
                  </span>
                  <span className={styles.amount}>{calculateTotal()}</span>
                </div>
              </div>
            </div>
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
