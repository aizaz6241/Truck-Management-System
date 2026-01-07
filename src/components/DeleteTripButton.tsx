"use client";

import { deleteTrip } from "@/actions/trip";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteTripButton({ id }: { id: number }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this trip?")) {
            setIsPending(true);
            await deleteTrip(id);
            setIsPending(false);
            router.refresh();
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="btn"
            style={{
                backgroundColor: "#dc3545",
                color: "white",
                padding: "0.25rem 0.5rem",
                fontSize: "0.875rem",
                marginLeft: "0.5rem"
            }}
        >
            {isPending ? "Deleting..." : "Delete"}
        </button>
    );
}
