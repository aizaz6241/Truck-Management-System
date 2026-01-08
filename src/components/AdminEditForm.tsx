"use client";

import { useActionState, useState } from "react";
import { updateAdmin } from "@/actions/admin";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminEditForm({ admin }: { admin: any }) {
    const updateAdminWithId = updateAdmin.bind(null, admin.id);
    const [state, action, isPending] = useActionState(updateAdminWithId, null);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form action={action}>
            {state?.message && (
                <div className={`p-3 rounded mb-4 text-sm ${state.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} style={{ padding: '0.75rem', borderRadius: '0.25rem', marginBottom: '1rem', backgroundColor: state.success ? '#d1fae5' : '#fee2e2', color: state.success ? '#065f46' : '#991b1b' }}>
                    {state.message}
                </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Name</label>
                <input
                    type="text"
                    name="name"
                    defaultValue={admin.name}
                    required
                    style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Email</label>
                <input
                    type="email"
                    name="email"
                    defaultValue={admin.email}
                    required
                    style={{ width: '100%', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                />
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid #f3f4f6', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Change Password</h3>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>New Password</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Leave blank to keep current"
                            style={{ width: '100%', padding: '0.5rem 2.5rem 0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
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
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Only enter if you want to change the user's password.</p>
                </div>
            </div>

            <div style={{ paddingTop: '0.5rem' }}>


                <button
                    type="submit"
                    disabled={isPending}
                    style={{
                        padding: '0.5rem 1.5rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        fontWeight: 500,
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: isPending ? 'not-allowed' : 'pointer',
                        opacity: isPending ? 0.7 : 1,
                        display: "flex", alignItems: "center", gap: "0.5rem"
                    }}
                >
                    {isPending ? <><LoadingSpinner size={16} /> Updating...</> : "Update Admin"}
                </button>
            </div>
        </form>
    );
}
