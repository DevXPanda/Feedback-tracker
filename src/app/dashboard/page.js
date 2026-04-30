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
import CreateActionModal from "@/components/CreateActionModal";
import TeamCard from "@/components/TeamCard";
import ShareModal from "@/components/ShareModal";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();
  const [storedUser, setStoredUser] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Prevent scroll jump and layout shifts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      router.push("/");
    } else {
      setStoredUser(user);
    }
  }, [router]);

  // Fetch full user details to get live click count
  const user = useQuery(api.users.getUserById,
    storedUser?._id ? { userId: storedUser._id } : "skip"
  );
  const teams = useQuery(api.teams.getTeams) || [];
  const stats = useQuery(api.teams.getGlobalStats);

  if (!user || !teams || !stats) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.ward.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/track?memberId=${user._id}`
    : "";

  return (
    <div className="min-h-screen bg-[#fcfcfd] transition-opacity duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold font-display text-gray-900 tracking-tight">Admin Dashboard</h1>
            {/* <p className="text-sm text-gray-500 mt-1.5 font-medium">
              Welcome back, {user.name}. Here's your team performance overview.
            </p> */}
          </div>

          <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:items-center sm:w-auto">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 h-12 bg-white border border-gray-200 rounded-xl hover:border-primary-200 hover:bg-primary-50 transition-all active:scale-95 overflow-hidden"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 shrink-0">
                <Share2 className="h-4 w-4" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[8px] sm:text-[9px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1 truncate">Share link</p>
                <p className="text-[10px] sm:text-xs font-semibold text-gray-700 leading-none truncate">
                  {user.clickCount || 0} Personal
                </p>
              </div>
            </button>

            <div className="relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-3.5 sm:h-4 w-3.5 sm:w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-400 transition-all sm:w-64"
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
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 mb-10">
          <StatCard
            title="Total Clicks"
            value={stats.totalClicks}
            icon={MousePointer2}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            trend={stats.clickTrend}
          />
          <StatCard
            title="Active Teams"
            value={stats.totalTeams}
            icon={Users}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
          <StatCard
            title="Covered Wards"
            value={stats.uniqueWards}
            icon={Map}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold font-display text-gray-900 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
              Team Performance
            </h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 group"
            >
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              Create
            </button>
          </div>

          <div className="transition-all">
            {filteredTeams.length === 0 ? (
              <div className="rounded-[2.5rem] bg-white border border-dashed border-gray-200 p-20 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-gray-300 mb-6">
                  <LayoutDashboard className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No teams found</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">Click the Create button to start building your high-performance team network.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {filteredTeams.map((team) => (
                  <TeamCard key={team._id} team={team} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateActionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, iconColor, iconBg, trend }) {
  const shortTitles = {
    "Total Clicks": "Clicks",
    "Active Teams": "Teams",
    "Covered Wards": "Wards"
  };

  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white p-3 sm:p-5 border border-gray-200 transition-all hover:border-gray-300">
      <div className="flex flex-col relative z-10">
        <div className="flex items-start justify-between">
          <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-tight">
            <span className="sm:hidden">{shortTitles[title] || title}</span>
            <span className="hidden sm:inline">{title}</span>
          </p>
          <div className={`flex h-6 w-6 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl ${iconBg} ${iconColor} shrink-0`}>
            <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
          </div>
        </div>

        <div className="mt-1 sm:mt-2 flex items-baseline gap-2">
          <h3 className="text-base sm:text-2xl font-semibold text-gray-800 font-display tracking-tight truncate">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {trend && (
            <div className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[11px] font-bold text-emerald-600">
              <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3" />
              <span>{trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
