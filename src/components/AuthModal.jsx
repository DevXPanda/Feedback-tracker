"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import { LogIn, Loader2, Shield, X } from "lucide-react";
import { toast } from "sonner";
import { setSession } from "@/lib/auth";
import { useAuthModal } from "@/context/AuthModalContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AuthModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Reactive login approach using Convex query
  const loginUser = useQuery(api.users.login, { identifier, password });

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Small timeout to simulate network
      await new Promise(r => setTimeout(r, 1000));

      if (loginUser) {
        setSession(loginUser);
        toast.success(`${t("auth.login_success")}, ${loginUser.name}!`);
        
        onClose(); // Close the modal

        // Redirect based on role
        if (loginUser.role === "admin") {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/team";
        }
      } else {
        toast.error(t("auth.login_error"));
      }
    } catch (error) {
      toast.error(t("auth.generic_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container - Matching original Login Card style */}
      <div className="relative w-full max-w-[400px] transform overflow-hidden rounded-2xl bg-white p-8 shadow-2xl transition-all animate-in fade-in zoom-in duration-200 border border-gray-200">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white mb-4 shadow-md shadow-primary-100">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold font-display text-gray-800 tracking-tight">
            {t("auth.welcome_back")}
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            {t("auth.login_desc")}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1 uppercase tracking-wider">
              {t("auth.mobile_number")}
            </label>
            <input
              required
              type="text"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
              placeholder={t("auth.mobile_number")}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1 uppercase tracking-wider">
              {t("auth.password")}
            </label>
            <input
              required
              type="password"
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-sm shadow-primary-200 mt-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>{t("auth.sign_in")}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <p className="text-xs text-gray-400">
            {t("auth.admin_note")}
          </p>
          <p className="text-[10px] text-gray-400 mt-1 italic">
            {t("auth.demo_note")}
          </p>
        </div>
      </div>
    </div>
  );
}
