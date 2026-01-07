"use client";

import { deleteDriver } from "@/actions/driver";
import { useRouter } from "next/navigation";

export default function DeleteDriverButton({ id }: { id: number }) {
    const router = useRouter();
    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this driver? Associated trips might remain but without driver info.")) {
            await deleteDriver(id);
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
