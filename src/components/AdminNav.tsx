"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { useRouter } from "next/navigation";
import { useLoading } from "@/components/LoadingProvider";

export default function AdminNav() {
    const { t } = useLanguage();
    const router = useRouter();
    const { startLoading } = useLoading();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    };

    const handleLinkClick = (href: string) => {
        if (window.location.pathname !== href) {
            startLoading();
        }
    };

    return (
        <nav style={{ backgroundColor: "var(--surface-color)", borderBottom: "1px solid var(--border-color)", padding: "1rem", marginBottom: "2rem" }}>
            <div className="container nav-container">
                <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: "var(--primary-color)" }}>
                    {t("app.title")} - {t("admin.dashboard")}
                </div>
                <div className="nav-links">
                    <Link href="/admin" onClick={() => handleLinkClick("/admin")}>{t("nav.home")}</Link>
                    <Link href="/admin/vehicles" onClick={() => handleLinkClick("/admin/vehicles")}>{t("nav.vehicles")}</Link>
                    <Link href="/admin/drivers" onClick={() => handleLinkClick("/admin/drivers")}>{t("nav.drivers")}</Link>
                    <Link href="/admin/trips" onClick={() => handleLinkClick("/admin/trips")}>{t("nav.trips")}</Link>
                    <Link href="/admin/logs" onClick={() => handleLinkClick("/admin/logs")}>Logs</Link>
                    <Link href="/admin/settings" onClick={() => handleLinkClick("/admin/settings")}>Settings</Link>
                    <button onClick={handleLogout} style={{ background: "none", border: "none", color: "var(--danger-color)", fontSize: "1rem" }}>
                        {t("nav.logout")}
                    </button>
                </div>
            </div>
        </nav>
    );
}
