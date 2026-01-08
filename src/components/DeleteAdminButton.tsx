"use client";

import { deleteAdmin } from "@/actions/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteAdminButton({ id }: { id: number }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this admin? This action cannot be undone.")) {
            setIsPending(true);
            const res = await deleteAdmin(id);
            setIsPending(false);
            if (res.success) {
                router.refresh();
            } else {
                alert(res.message);
            }
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="btn"
            style={{
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                padding: "0.25rem 0.5rem",
                fontSize: "0.875rem",
                border: "1px solid #fecdd3"
            }}
        >
            {isPending ? "Deleting..." : "Delete"}
        </button>
    );
}
