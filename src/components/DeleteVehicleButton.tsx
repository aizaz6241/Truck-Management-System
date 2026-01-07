"use client";

import { deleteVehicle } from "@/actions/vehicle";
import { useRouter } from "next/navigation";

export default function DeleteVehicleButton({ id }: { id: number }) {
    const router = useRouter();
    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this vehicle? This might affect trip records.")) {
            await deleteVehicle(id);
            router.refresh();
        }
    };

    return (
        <button
            onClick={handleDelete}
            style={{
                background: "none",
                border: "none",
                color: "var(--danger-color, red)",
                cursor: "pointer",
                textDecoration: "underline"
            }}
        >
            Delete
        </button>
    );
}
