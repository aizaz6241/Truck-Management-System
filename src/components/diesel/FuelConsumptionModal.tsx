"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import styles from "./FuelConsumptionModal.module.css";
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
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalWrapper}>
        <div className={styles.modal}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h3>Fuel Breakdown</h3>
              <span className={styles.headerSubtitle}>Consumption Stats</span>
            </div>
            <button onClick={onClose} className={styles.closeBtn} type="button">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.chartContainer}>
              {/* Center Text */}
              <div className={styles.centerLabel}>
                <span className={styles.centerLabelTitle}>Total</span>
                <span className={styles.centerLabelValue}>
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
                    cornerRadius={8}
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      padding: "12px 16px",
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                    }}
                    itemStyle={{
                      fontWeight: 700,
                      color: "#1f2937",
                      fontSize: "0.9rem",
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
                    iconSize={10}
                    wrapperStyle={{
                      paddingTop: "20px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#4b5563",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.summaryBox}>
              <p className={styles.summaryLabel}>Total Consumption</p>
              <div className={styles.summaryValueGroup}>
                <p className={styles.summaryValue}>
                  {totalLiters.toLocaleString()}
                </p>
                <span className={styles.summaryUnit}>Liters</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
