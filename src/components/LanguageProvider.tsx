"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ur";

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: string) => string;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
    en: {
        "app.title": "Truck Trip Management",
        "login.title": "Login",
        "login.email": "Email / Username",
        "login.password": "Password",
        "login.button": "Login",
        "admin.dashboard": "Admin Dashboard",
        "driver.dashboard": "Driver Dashboard",
        "nav.home": "Home",
        "nav.vehicles": "Vehicles",
        "nav.drivers": "Drivers",
        "nav.trips": "Trips",
        "nav.logout": "Logout",
        "trip.add": "Add Trip",
        "common.active": "Active",
        "common.inactive": "Inactive",
        "common.submit": "Submit",
        "common.cancel": "Cancel",
    },
    ur: {
        "app.title": "ٹرک وہیکل مینجمنٹ سسٹم",
        "login.title": "لاگ ان کریں",
        "login.email": "ای میل / صارف نام",
        "login.password": "پاس ورڈ",
        "login.button": "لاگ ان",
        "admin.dashboard": "ایڈمن ڈیش بورڈ",
        "driver.dashboard": "ڈرائیور ڈیش بورڈ",
        "nav.home": "ہوم",
        "nav.vehicles": "گاڑیاں",
        "nav.drivers": "ڈرائیورز",
        "nav.trips": "ٹرپس",
        "nav.logout": "لاگ آؤٹ",
        "trip.add": "نئی ٹرپ شامل کریں",
        "common.active": "فعال",
        "common.inactive": "غیر فعال",
        "common.submit": "جمع کرائیں",
        "common.cancel": "منسوخ کریں",
    },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === "en" ? "ur" : "en"));
    };

    const t = (key: string) => {
        // @ts-ignore
        return translations[language][key] || key;
    };

    const isRTL = language === "ur";

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t, isRTL }}>
            <div dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "font-urdu" : "font-english"}>
                {children}
            </div>
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
