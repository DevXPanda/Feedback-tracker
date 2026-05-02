"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Home, LogOut, LogIn, Languages } from "lucide-react";
import { clsx } from "clsx";
import { useAuthModal } from "@/context/AuthModalContext";
import { useLanguage } from "@/context/LanguageContext";
import { getSession, clearSession } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { openAuthModal } = useAuthModal();
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = getSession();
      setUser(storedUser);
      setLoading(false);
    };

    checkAuth();
    // Sync across tabs/windows
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname]); // Re-check on navigation

  const handleLogout = () => {
    clearSession();
    setUser(null);
    router.push("/");
    // Force a small delay to ensure state clears before redirect
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link 
            href={user?.role === "admin" ? "/dashboard" : user?.role === "team" ? "/team" : "/"} 
            className="flex items-center gap-2.5 group"
          >
            <span className="text-base font-semibold font-display tracking-tight text-gray-900 block">
              Feedback<span className="text-primary-600">Tracker</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleLanguage}
            className="group flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50/50 px-3 py-1.5 transition-all hover:bg-white hover:shadow-sm active:scale-95"
            title={language === "en" ? "हिन्दी में बदलें" : "Switch to English"}
          >
            <div className="flex items-center justify-center rounded-full bg-primary-100 p-1 text-primary-600">
              <Languages className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              {language === "en" ? "English" : "हिन्दी"}
            </span>
          </button>

          <div className="h-4 w-px bg-gray-200" />

          {!loading && (
            user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:block">{t("common.logout")}</span>
              </button>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors active:scale-95"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{t("common.login")}</span>
              </button>
            )
          )}

          {loading && (
            <div className="h-8 w-24 bg-gray-50 animate-pulse rounded-lg"></div>
          )}
        </div>
      </div>
    </nav>
  );
}
