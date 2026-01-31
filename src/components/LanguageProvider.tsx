"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ur";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

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
    "nav.language": "اردو",
    "trip.add": "Add Trip",
    "common.active": "Active",
    "common.inactive": "Inactive",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "driver.pageTitle": "My Trips",
    "driver.hello": "Hello",
    "common.trip": "Trip",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "trip.driver": "Driver Name",
    "trip.vehicle": "Vehicle",
    "trip.from": "From Location",
    "trip.to": "To Location",
    "trip.date": "Date",
    "trip.material": "Material Type",
    "trip.paper": "Paper Image",
    "trip.upload": "Upload Paper",
    "trip.gallery": "Gallery",
    "trip.camera": "Camera",
    "trip.selectVehicle": "-- Select Vehicle --",
    "trip.selectMaterial": "-- Select Material --",
    "common.trips": "Trips",
    "diesel.fuelManagement": "Fuel Management",
    "diesel.add": "Add Diesel",
    "diesel.edit": "Edit Record",
    "diesel.new": "New Diesel Entry",
    "diesel.date": "Date",
    "diesel.vehicle": "Vehicle",
    "diesel.driver": "Driver",
    "diesel.odometer": "Odometer",
    "diesel.volume": "Fuel Volume",
    "diesel.rate": "Price / Unit",
    "diesel.total": "Total Cost",
    "diesel.liters": "Liters",
    "diesel.currency": "AED",
    "diesel.processing": "Processing...",
    "diesel.optional": "(Optional)",
    "diesel.autocalc": "Auto-calculated",
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
    "nav.language": "English",
    "trip.add": "نئی ٹرپ شامل کریں",
    "common.trips": "ٹرپس",
    "diesel.fuelManagement": "فیول مینجمنٹ",
    "common.active": "فعال",
    "common.inactive": "غیر فعال",
    "common.submit": "جمع کرائیں",
    "common.cancel": "منسوخ کریں",
    "driver.pageTitle": "میری ٹرپس",
    "driver.hello": "خوش آمدید",
    "common.trip": "ٹرپ",
    "common.edit": "تبدیل کریں",
    "common.delete": "ختم کریں",
    "trip.driver": "ڈرائیور کا نام",
    "trip.vehicle": "گاڑی",
    "trip.from": "کہاں سے",
    "trip.to": "کہاں تک",
    "trip.date": "تاریخ",
    "trip.material": "میٹیریل",
    "trip.paper": "پریسد",
    "trip.upload": "رسید اپ لوڈ کریں",
    "trip.gallery": "گیلری",
    "trip.camera": "کیمرہ",
    "trip.selectVehicle": "-- گاڑی منتخب کریں --",
    "trip.selectMaterial": "-- میٹیریل منتخب کریں --",
    "diesel.add": "ڈیزل شامل کریں",
    "diesel.edit": "ریکارڈ تبدیل کریں",
    "diesel.new": "نیا ڈیزل اندراج",
    "diesel.date": "تاریخ",
    "diesel.vehicle": "گاڑی",
    "diesel.driver": "ڈرائیور",
    "diesel.odometer": "اوڈومیٹر",
    "diesel.volume": "فیول والیوم",
    "diesel.rate": "فی یونٹ قیمت",
    "diesel.total": "کل قیمت",
    "diesel.liters": "لیٹر",
    "diesel.currency": "درہم",
    "diesel.processing": "عمل جاری ہے...",
    "diesel.optional": "(اختیاری)",
    "diesel.autocalc": "خودکار حساب",
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
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={isRTL ? "font-urdu" : "font-english"}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Fallback if provider is missing (e.g. during specific SSR edge cases)
    // Return default English context
    return {
      language: "en" as Language,
      toggleLanguage: () => {},
      t: (key: string) => {
        // @ts-ignore
        return translations["en"][key] || key;
      },
      isRTL: false,
    };
  }
  return context;
}
