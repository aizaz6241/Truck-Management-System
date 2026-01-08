"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Redirect handled by router based on response or logic
            // API returns redirect url
            router.push(data.redirect || "/");
            router.refresh(); // Refresh to update session state in middleware/layout

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
                <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>{t("login.title")}</h2>

                {error && (
                    <div style={{ backgroundColor: "#f8d7da", color: "#721c24", padding: "0.75rem", borderRadius: "4px", marginBottom: "1rem" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">{t("login.email")}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t("login.password")}</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }} disabled={isLoading}>
                        {isLoading ? <><LoadingSpinner size={16} /> Signing in...</> : t("login.button")}
                    </button>
                </form>
            </div>
        </div>
    );
}
