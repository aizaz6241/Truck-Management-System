"use client";

import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";

export default function Home() {
  const { t, toggleLanguage, language } = useLanguage();

  return (
    <main className="container" style={{ paddingTop: "4rem", textAlign: "center" }}>
      <h1>{t("app.title")}</h1>
      <div style={{ margin: "2rem 0" }}>
        <button onClick={toggleLanguage} className="btn btn-primary">
          {language === "en" ? "اردو" : "English"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem" }}>
        <Link href="/login" className="btn btn-primary">
          {t("login.button")}
        </Link>
        <Link href="/admin" className="btn" style={{ backgroundColor: "var(--secondary-color)", color: "white" }}>
          {t("admin.dashboard")}
        </Link>
      </div>
    </main>
  );
}
