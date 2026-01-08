"use client";

import { useActionState, useState } from "react";
import { updateAdminProfile, createAdmin } from "@/actions/admin";

function PasswordInput({ name, placeholder, required = false }: { name: string, placeholder?: string, required?: boolean }) {
    const [show, setShow] = useState(false);
    return (
        <div style={{ position: 'relative' }}>
            <input
                type={show ? "text" : "password"}
                name={name}
                placeholder={placeholder}
                required={required}
                className="form-input"
                style={{ paddingRight: '2.5rem' }}
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
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
                title={show ? "Hide password" : "Show password"}
            >
                {show ? (
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
    );
}

export function ProfileForm() {
    const [state, action, isPending] = useActionState(updateAdminProfile, null);

    return (
        <div className="settings-card">
            <h2 className="settings-card-title">My Profile</h2>
            {state?.message && (
                <div className={state.success ? 'alert-success' : 'alert-error'}>
                    {state.message}
                </div>
            )}
            <form action={action}>
                <div className="form-group-spaced">
                    <label className="form-label">Name</label>
                    <input type="text" name="name" required className="form-input" />
                </div>
                <div className="form-group-spaced">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" required className="form-input" />
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid #f3f4f6', marginTop: '1rem' }}>
                    <h3 className="settings-section-title">Change Password</h3>
                    <div className="form-group-spaced">
                        <label className="form-label">New Password</label>
                        <PasswordInput name="password" placeholder="Leave blank to keep current" />
                    </div>
                    <div className="form-group-spaced">
                        <label className="form-label">Confirm New Password</label>
                        <PasswordInput name="confirmPassword" placeholder="Confirm new password" />
                    </div>
                </div>

                <div style={{ paddingTop: '0.5rem' }}>
                    <button type="submit" disabled={isPending} className="btn btn-primary" style={{ width: '100%' }}>
                        {isPending ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export function AddAdminForm() {
    const [state, action, isPending] = useActionState(createAdmin, null);

    return (
        <div className="settings-card">
            <h2 className="settings-card-title">Add New Admin</h2>
            {state?.message && (
                <div className={state.success ? 'alert-success' : 'alert-error'}>
                    {state.message}
                </div>
            )}
            <form action={action}>
                <div className="form-group-spaced">
                    <label className="form-label">Name</label>
                    <input type="text" name="name" required className="form-input" />
                </div>
                <div className="form-group-spaced">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" required className="form-input" />
                </div>
                <div className="form-group-spaced">
                    <label className="form-label">Password</label>
                    <PasswordInput name="password" required={true} />
                </div>
                <div style={{ paddingTop: '0.5rem' }}>
                    <button type="submit" disabled={isPending} className="btn" style={{ width: '100%', backgroundColor: '#111827', color: 'white' }}>
                        {isPending ? "Creating..." : "Create Admin"}
                    </button>
                </div>
            </form>
        </div>
    );
}
