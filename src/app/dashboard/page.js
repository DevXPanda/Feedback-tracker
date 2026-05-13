"use client";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  Users,
  MousePointer2,
  TrendingUp,
  Search,
  Share2,
  Plus,
  Target,
  Award,
  Clock
} from "lucide-react";
import CreateActionModal from "@/components/CreateActionModal";
import TargetModal from "@/components/TargetModal";
import ShareModal from "@/components/ShareModal";
import { useLanguage } from "@/context/LanguageContext";

export default function Dashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [storedUser, setStoredUser] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      router.push("/");
    } else {
      setStoredUser(user);
    }
  }, [router]);

  const user = useQuery(api.users.getUserById,
    storedUser?._id ? { userId: storedUser._id, ulbId: storedUser.ulbId } : "skip"
  );
  const stats = useQuery(api.teams.getGlobalStats, 
    storedUser?.ulbId ? { ulbId: storedUser.ulbId } : "skip"
  );
  const allMemberStats = useQuery(api.teams.getAllMemberStats,
    storedUser?.ulbId ? { ulbId: storedUser.ulbId } : "skip"
  );

  if (!user || !stats) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredMembers = allMemberStats?.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/track?${user.role === 'admin' ? 'userId' : 'teamMemberId'}=${user._id}&ulbId=${user.ulbId}`
    : "";

  return (
    <div className="min-h-screen bg-[#fcfcfd] transition-opacity duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold font-display text-gray-900 tracking-tight">{t("common.dashboard")}</h1>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 h-12 bg-white border border-gray-200 rounded-xl hover:border-primary-200 hover:bg-primary-50 transition-all active:scale-95 overflow-hidden"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 shrink-0">
                <Share2 className="h-4 w-4" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[8px] sm:text-[9px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1 truncate">{t("dashboard.share_link")}</p>
                <p className="text-[10px] sm:text-xs font-semibold text-gray-700 leading-none truncate">
                  {user.clickCount || 0} Personal
                </p>
              </div>
            </button>

            <div className="relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-3.5 sm:h-4 w-3.5 sm:w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder={t("dashboard.search_placeholder")}
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
          <StatCard
            title={t("dashboard.total_feedback")}
            value={stats.totalClicks}
            icon={MousePointer2}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            title={t("dashboard.active_members")}
            value={stats.totalMembers || 0}
            icon={Users}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
          <StatCard
            title={t("common.today")}
            value={stats.todayCount || 0}
            icon={TrendingUp}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            title={t("dashboard.target")}
            value={`${stats.targetAchievement || 0} / ${stats.totalTarget || 0}`}
            icon={Target}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
        </div>

        <div className="space-y-12">
          {/* Member Performance Summary Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
              <h2 className="text-lg font-semibold font-display text-gray-900 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                {t("dashboard.member_performance")}
              </h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsTargetModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 group"
                >
                  <Target className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  {t("dashboard.target")}
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 group"
                >
                  <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  {t("dashboard.add_member")}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest min-w-[200px]">{t("common.name")}</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center min-w-[100px]">{t("common.today")}</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center min-w-[150px]">{t("dashboard.total_feedback")}</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center min-w-[140px]">{t("dashboard.target")}</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right min-w-[120px]">{t("common.activity")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredMembers?.map((member) => (
                      <tr 
                        key={member._id} 
                        className="hover:bg-gray-50/30 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/dashboard/member/${member._id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm">
                              {member.name.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-primary-600">
                            {member.today}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-gray-700">
                            {member.total.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            {member.target ? (
                              <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap tracking-tight ${
                                member.targetPercentage >= 100 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                  : member.targetPercentage > 0 
                                    ? "bg-amber-50 text-amber-700 border-amber-100" 
                                    : "bg-red-50 text-red-700 border-red-100"
                              }`}>
                                <Target className="h-3.5 w-3.5" />
                                <span>{member.targetAchievement} / {member.target}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{t("dashboard.no_target")}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {member.lastActive ? (
                               <>
                                 <Clock className="h-3 w-3" />
                                 {Math.round((Date.now() - member.lastActive) / 60000)}{t("common.mins")} {t("common.ago")}
                               </>
                            ) : (
                               t("common.never")
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!filteredMembers || filteredMembers.length === 0) && (
                      <tr>
                        <td colSpan="5" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                             <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                               <Users className="h-6 h-6" />
                             </div>
                             <p className="text-sm text-gray-400 font-medium">{t("dashboard.no_results")}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateActionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <TargetModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
      />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, iconColor, iconBg, trend }) {
  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white p-3 sm:p-5 border border-gray-200 transition-all hover:border-gray-300 shadow-sm">
      <div className="flex flex-col relative z-10">
        <div className="flex items-start justify-between">
          <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-tight">
            {title}
          </p>
          <div className={`flex h-6 w-6 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl ${iconBg} ${iconColor} shrink-0`}>
            <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
          </div>
        </div>

        <div className="mt-1 sm:mt-2 flex items-baseline gap-2">
          <h3 className="text-base sm:text-2xl font-bold text-gray-900 font-display tracking-tight truncate">
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
