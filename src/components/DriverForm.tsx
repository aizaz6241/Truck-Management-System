"use client";

import { useActionState, useState } from "react";
import { createDriver, updateDriver } from "@/actions/driver";

export default function DriverForm({ driver }: { driver?: any }) {
    const updateDriverWithId = updateDriver.bind(null, driver?.id);
    const action = driver ? updateDriverWithId : createDriver;
    const [showPassword, setShowPassword] = useState(false);

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

            <div className="form-group">
                <label className="form-label">{driver ? "New Password" : "Password"}</label>
                <div style={{ position: 'relative' }}>
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="form-input"
                        required={!driver}
                        placeholder={driver ? "Leave blank to keep current" : ""}
                        style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280'
                        }}
                        title={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </button>
                </div>
                {driver && <small style={{ color: "#666" }}>Only enter to help driver reset password</small>}
            </div>

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
