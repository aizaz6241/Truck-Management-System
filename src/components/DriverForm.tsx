"use client";

import { useActionState } from "react";
import { createDriver, updateDriver } from "@/actions/driver";

export default function DriverForm({ driver }: { driver?: any }) {
    const updateDriverWithId = updateDriver.bind(null, driver?.id);
    const action = driver ? updateDriverWithId : createDriver;

    // @ts-ignore
    const [state, formAction, isPending] = useActionState(action, { message: "" });

    return (
        <form action={formAction} className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
            {state?.message && <div style={{ color: "red", marginBottom: "1rem" }}>{state.message}</div>}

            <div className="form-group">
                <label className="form-label">Driver Name</label>
                <input name="name" defaultValue={driver?.name} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">Email / Username</label>
                <input name="email" defaultValue={driver?.email} className="form-input" required disabled={!!driver} />
                {driver && <small style={{ color: "#666" }}>Email cannot be changed</small>}
            </div>

            {!driver && (
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input name="password" type="password" className="form-input" required />
                </div>
            )}

            <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input name="phone" defaultValue={driver?.phone} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">CNIC (Optional)</label>
                <input name="cnic" defaultValue={driver?.cnic} className="form-input" />
            </div>

            <div className="form-group">
                <label className="form-label">Salary</label>
                <input name="salary" defaultValue={driver?.salary} className="form-input" placeholder="e.g. 50000" />
            </div>



            {driver && (
                <div className="form-group">
                    <label className="form-label">Status</label>
                    <select name="status" defaultValue={driver.isActive ? "Active" : "Inactive"} className="form-select">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            )}

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
                <button type="submit" className="btn btn-primary">{driver ? "Update" : "Create"} Driver</button>
                <a href="/admin/drivers" className="btn" style={{ backgroundColor: "#ccc" }}>Cancel</a>
            </div>
        </form>
    );
}
