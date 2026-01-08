"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth"; // We need a client-side wrapper or server action. 
// Wait, `logout` in lib/auth is server-side (cookies). Client component can't call it directly unless it's a Server Action.
// I'll assume I need to make a server action or API route for logout.
// Or just clear cookie client side? modifying cookie on client is possible if httpOnly is false, but I set it true.
// So I need an API route `/api/auth/logout`.

export default function AdminNav() {
    const { t } = useLanguage();
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login"); // or root
        router.refresh();
    };

    return (
        <nav style={{ backgroundColor: "var(--surface-color)", borderBottom: "1px solid var(--border-color)", padding: "1rem", marginBottom: "2rem" }}>
            <div className="container nav-container">
                <div style={{ fontWeight: "bold", fontSize: "1.2rem", color: "var(--primary-color)" }}>
                    {t("app.title")} - {t("admin.dashboard")}
                </div>
                <div className="nav-links">
                    <Link href="/admin">{t("nav.home")}</Link>
                    <Link href="/admin/vehicles">{t("nav.vehicles")}</Link>
                    <Link href="/admin/drivers">{t("nav.drivers")}</Link>
                    <Link href="/admin/trips">{t("nav.trips")}</Link>
                    <Link href="/admin/logs">Logs</Link>
                    <Link href="/admin/settings">Settings</Link>
                    <button onClick={handleLogout} style={{ background: "none", border: "none", color: "var(--danger-color)", fontSize: "1rem" }}>
                        {t("nav.logout")}
                    </button>
                </div>
            </div>
        </nav>
    );
}
