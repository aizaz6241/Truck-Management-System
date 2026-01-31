"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { deleteTaxiOwner } from "@/actions/taxi-owner";
import { useState } from "react";
import AddTaxiOwnerModal from "@/components/taxi/AddTaxiOwnerModal";
import {
  PencilSquareIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import styles from "./TaxiOwner.module.css";

export default function TaxiOwnerList({ owners }: { owners: any[] }) {
  const { t } = useLanguage();
  const [editingOwner, setEditingOwner] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this owner?")) return;
    setDeletingId(id);
    await deleteTaxiOwner(id);
    setDeletingId(null);
  };

  const handleEdit = (owner: any) => {
    setEditingOwner(owner);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingOwner(null);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Taxi Owners</h1>
        <button onClick={handleAdd} className={styles.addButton}>
          + Add New Owner
        </button>
      </div>

      {owners.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#6b7280" }}>
          <p className="text-xl">No taxi owners found.</p>
          <p className="mt-2 text-sm">Click "Add New Owner" to get started.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {owners.map((owner) => (
            <div key={owner.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.name}>{owner.name}</h3>
                  {owner.emiratesId && (
                    <span className={styles.emiratesId}>
                      ID: {owner.emiratesId}
                    </span>
                  )}
                </div>
                <div className={styles.actions}>
                  <button
                    onClick={() => handleEdit(owner)}
                    className={styles.editButton}
                    title="Edit"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(owner.id)}
                    disabled={deletingId === owner.id}
                    className={styles.deleteButton}
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className={styles.stats}>
                <span className={styles.vehicleCount}>
                  <TruckIcon className="h-4 w-4 inline mr-1" />
                  {owner._count?.vehicles || 0} Vehicles
                </span>
              </div>

              <div className={styles.contactInfo}>
                <div className={styles.contactRow}>
                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                  <span>{owner.phone || "No Phone"}</span>
                </div>
                <div className={styles.contactRow}>
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  <span>{owner.email || "No Email"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTaxiOwnerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialData={editingOwner}
      />
    </div>
  );
}
