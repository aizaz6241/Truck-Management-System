"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { useRouter } from "next/navigation";

import { useLoading } from "@/components/LoadingProvider";

export default function DriverNav() {
    const { t, toggleLanguage } = useLanguage();
    const router = useRouter();
    const { startLoading } = useLoading();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    };

    return (
        <nav style={{ backgroundColor: "var(--surface-color)", borderBottom: "1px solid var(--border-color)", padding: "1rem", marginBottom: "2rem" }}>
            <div className="container nav-container">
                <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: "var(--primary-color)" }}>
                    {t("app.title")} - {t("driver.dashboard")}
                </div>
                <div className="nav-links">
                    <button
                        onClick={toggleLanguage}
                        style={{
                            background: "none",
                            border: "1px solid var(--primary-color)",
                            borderRadius: "4px",
                            color: "var(--primary-color)",
                            fontSize: "0.9rem",
                            padding: "0.25rem 0.5rem",
                            cursor: "pointer"
                        }}
                    >
                        {t("nav.language")}
                    </button>
                    <button onClick={handleLogout} style={{ background: "none", border: "none", color: "var(--danger-color)", fontSize: "1rem" }}>
                        {t("nav.logout")}
                    </button>
                </div>
            </div>
        </nav>
    );
}
