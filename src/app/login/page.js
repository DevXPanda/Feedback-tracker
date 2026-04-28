"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import { LogIn, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // We use the login query from Convex
  const user = useQuery(api.users.login, { email, password });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Small timeout to simulate network
      await new Promise(r => setTimeout(r, 1000));

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        toast.success(`Welcome back, ${user.name}!`);
        
        if (user.role === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/team");
        }
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6 bg-[#fcfcfd]">
      <div className="w-full max-w-[400px]">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white mb-4 shadow-md shadow-primary-100">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-semibold font-display text-gray-800 tracking-tight">Welcome Back</h1>
            <p className="text-xs text-gray-500 mt-2">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1 uppercase tracking-wider">Email Address</label>
              <input
                required
                type="email"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1 uppercase tracking-wider">Password</label>
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
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-400">
              Admin? Use your designated credentials.
            </p>
            <p className="text-[10px] text-gray-400 mt-1 italic">
              Note: This is a demo system. Please ensure your account exists.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
