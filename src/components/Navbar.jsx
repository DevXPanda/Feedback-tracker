"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Home, LogOut, LogIn } from "lucide-react";
import { clsx } from "clsx";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
      setLoading(false);
    };

    checkAuth();
    // Sync across tabs/windows
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname]); // Re-check on navigation

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
    // Force a small delay to ensure state clears before redirect
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home, show: !user },
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: LayoutDashboard, 
      show: user?.role === "admin" 
    },
    { 
      name: "Team Panel", 
      href: "/team", 
      icon: Users, 
      show: user?.role === "team" 
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-md shadow-primary-100 group-hover:bg-primary-700 transition-colors">
              <span className="text-lg font-bold font-display">F</span>
            </div>
            <span className="text-lg font-semibold font-display tracking-tight text-gray-800 hidden sm:block">
              FeedbackTracker
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 border-l border-gray-100 pl-6">
            {!loading && navItems.map((item) => {
              if (!item.show) return null;
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!loading && (
            user ? (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:block">Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </Link>
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
