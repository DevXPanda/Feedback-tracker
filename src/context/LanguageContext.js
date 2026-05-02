"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "@/lib/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("app_language");
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "hi")) {
      setLanguage(savedLanguage);
      document.documentElement.classList.remove("lang-en", "lang-hi");
      document.documentElement.classList.add(`lang-${savedLanguage}`);
    } else {
      document.documentElement.classList.add("lang-en");
    }
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "hi" : "en";
    setLanguage(newLang);
    localStorage.setItem("app_language", newLang);
    document.documentElement.classList.remove("lang-en", "lang-hi");
    document.documentElement.classList.add(`lang-${newLang}`);
  };

  const t = (path) => {
    const keys = path.split(".");
    let current = translations[language];

    for (const key of keys) {
      if (current[key] === undefined) {
        // Fallback to English if key missing in Hindi
        let fallback = translations["en"];
        for (const fKey of keys) {
          if (fallback[fKey] === undefined) return path;
          fallback = fallback[fKey];
        }
        return fallback;
      }
      current = current[key];
    }

    return current;
  };

  // Prevent hydration mismatch by only rendering after mount
  const value = {
    language,
    toggleLanguage,
    t,
    mounted
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
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
