"use client";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import { 
  Users, 
  MousePointer2, 
  Map, 
  TrendingUp,
  LayoutDashboard,
  Search,
  Filter,
  Share2
} from "lucide-react";
import TeamCard from "@/components/TeamCard";
import AddTeamForm from "@/components/AddTeamForm";
import ShareModal from "@/components/ShareModal";

export default function Dashboard() {
  const teams = useQuery(api.teams.getTeams);
  const router = useRouter();
  const [storedUser, setStoredUser] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Prevent scroll jump and layout shifts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      router.push("/login");
    } else {
      setStoredUser(user);
    }
  }, [router]);

  // Fetch full user details to get live click count
  const user = useQuery(api.users.getUserById, 
    storedUser?._id ? { userId: storedUser._id } : "skip"
  );

  if (!user || teams === undefined) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#fcfcfd]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  const totalClicks = teams.reduce((acc, team) => acc + team.clickCount, 0);
  const totalTeams = teams.length;
  const uniqueWards = new Set(teams.map(t => t.ward)).size;

  const trackingUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/track?memberId=${user._id}`
    : "";

  return (
    <div className="min-h-screen bg-[#fcfcfd] transition-opacity duration-300">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold font-display text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1.5 font-medium">
              Welcome back, {user.name}. Here's your team performance overview.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="group flex h-12 items-center gap-3 px-4 bg-white border border-gray-200 rounded-xl hover:border-primary-200 hover:bg-primary-50 transition-all shadow-sm active:scale-95"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors flex-shrink-0">
                <Share2 className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Share link</p>
                <p className="text-xs font-bold text-gray-700 leading-none whitespace-nowrap">
                  {user.clickCount || 0} Personal Entries
                </p>
              </div>
            </button>

            <div className="relative flex-shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search teams..." 
                className="h-12 pl-11 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary-400/20 focus:border-primary-400 transition-all w-48 sm:w-64 shadow-sm"
              />
            </div>
          </div>
        </header>

        <ShareModal 
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          trackingUrl={trackingUrl}
          memberName={user.name}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          <StatCard 
            title="Total Clicks" 
            value={totalClicks} 
            icon={MousePointer2} 
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            trend="+12% from yesterday"
          />
          <StatCard 
            title="Active Teams" 
            value={totalTeams} 
            icon={Users} 
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
          <StatCard 
            title="Covered Wards" 
            value={uniqueWards} 
            icon={Map} 
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Teams List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-semibold font-display text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary-500" />
                Team Performance
              </h2>
            </div>
            
            {teams.length === 0 ? (
              <div className="rounded-xl bg-white border border-gray-200 p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-300 mb-4">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">No teams found</h3>
                <p className="text-xs text-gray-500 mt-1">Start by adding a new team using the form.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams.map((team) => (
                  <TeamCard key={team._id} team={team} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Form */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <AddTeamForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, iconColor, iconBg, trend }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-200 transition-all hover:border-gray-300">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{title}</p>
          <h3 className="mt-2 text-2xl font-semibold text-gray-800 font-display tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {trend && (
            <div className="mt-3 flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 w-fit">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-[11px] font-semibold text-emerald-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
