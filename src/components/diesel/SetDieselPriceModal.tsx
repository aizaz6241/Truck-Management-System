"use client";

import { useState, useTransition } from "react";
import { bulkUpdateDieselPrices } from "@/actions/diesel";
import {
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import styles from "./AddDieselModal.module.css";
import { useLanguage } from "../LanguageProvider";

interface SetDieselPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SetDieselPriceModal({
  isOpen,
  onClose,
  onSuccess,
}: SetDieselPriceModalProps) {
  const { t, isRTL } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [price, setPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !price) return;

    startTransition(async () => {
      const res = await bulkUpdateDieselPrices(
        new Date(startDate),
        new Date(endDate),
        parseFloat(price),
      );

      if (res.success) {
        alert(`Successfully updated ${res.count} records.`);
        onSuccess();
        onClose();
      } else {
        alert(res.error || "Failed to update prices");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      style={{ direction: isRTL ? "rtl" : "ltr" }}
    >
      <div className={styles.modal} style={{ maxWidth: "500px" }}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2>Update Diesel Prices</h2>
            <span className={styles.tag}>Bulk Operation</span>
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
            <div
              className={styles.batchDateSection}
              style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}
            >
              <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold">
                <CalendarIcon className="w-5 h-5" />
                <span>Select Date Range</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={styles.field}>
                  <label className={styles.label}>From Date</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>To Date</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div
              className={styles.batchRow}
              style={{ borderLeft: "4px solid #10b981" }}
            >
              <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold">
                <CurrencyDollarIcon className="w-5 h-5" />
                <span>Set Unit Price</span>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Price Per Liter (AED)</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="number"
                    step="0.001"
                    className={styles.input}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="0.000"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 italic">
                  * This will update the price and total amount for all existing
                  diesel records within the selected dates.
                </p>
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
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              style={{ backgroundColor: "#10b981" }}
              disabled={isPending}
            >
              {isPending ? "Processing..." : "Update All Records"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
