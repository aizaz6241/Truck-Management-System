"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { createTaxiOwner, updateTaxiOwner } from "@/actions/taxi-owner";
import { useState, useTransition, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import styles from "./TaxiOwner.module.css";

interface AddTaxiOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export default function AddTaxiOwnerModal({
  isOpen,
  onClose,
  initialData,
}: AddTaxiOwnerModalProps) {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emiratesId, setEmiratesId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setEmail(initialData.email || "");
      setPhone(initialData.phone || "");
      setEmiratesId(initialData.emiratesId || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setEmiratesId("");
    }
    setError("");
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("emiratesId", emiratesId);

    startTransition(async () => {
      let res;
      if (initialData) {
        res = await updateTaxiOwner(initialData.id, null, formData);
      } else {
        res = await createTaxiOwner(null, formData);
      }

      if (res.success) {
        onClose();
        // Reset form if adding new
        if (!initialData) {
          setName("");
          setEmail("");
          setPhone("");
          setEmiratesId("");
        }
      } else {
        setError(res.message || "Failed to save owner");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {initialData ? "Edit Taxi Owner" : "Add Taxi Owner"}
          </h3>
          <button onClick={onClose} className={styles.closeButton}>
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded text-sm mb-4">
                {error}
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Phone</label>
              <input
                type="tel"
                className={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Emirates ID</label>
              <input
                type="text"
                className={styles.input}
                value={emiratesId}
                onChange={(e) => setEmiratesId(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Owner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
