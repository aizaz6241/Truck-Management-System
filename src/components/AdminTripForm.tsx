"use client";

import { useActionState, useState } from "react";
import { createTrip, updateTrip } from "@/actions/trip";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminTripForm({ trip, drivers, vehicles }: { trip?: any, drivers: any[], vehicles: any[] }) {


    // ... previous code ...

    const action = trip ? updateTrip.bind(null, trip.id) : createTrip;
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(action, { message: "" });

    return (
        <form action={formAction} className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
            {/* ... code ... */}

            <div style={{ marginTop: "1.5rem" }}>
                <button type="submit" className="btn btn-primary" style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }} disabled={isPending}>
                    {isPending ? <><LoadingSpinner size={16} /> Processing...</> : (trip ? "Update Trip" : "Create Trip")}
                </button>
            </div>
        </form>
    );
}
