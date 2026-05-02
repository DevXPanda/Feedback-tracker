"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  MousePointer2,
  Phone,
  Calendar,
  Globe,
  Clock,
  ExternalLink,
  User,
  Shield,
  Share2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Target,
  TrendingUp,
  BarChart3,
  History
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function MemberDetailsPage() {
  const params = useParams();
  const { t } = useLanguage();
  const router = useRouter();
  const userId = params.memberId;
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || storedUser.role !== "admin") {
      router.push("/");
    } else {
      setUser(storedUser);
    }
  }, [router]);

  const member = useQuery(api.users.getUserById, { userId });
  const stats = useQuery(api.users.getMemberStats, { userId });
  const activeTarget = useQuery(api.targets.getActiveTarget, { userId });
  const logs = useQuery(api.teams.getDetailedLogs, {
    userId,
    limit: 50,
    startDate: activeTarget?.startDate,
    endDate: activeTarget?.endDate
  });
  const flags = useQuery(api.teams.getMemberFlags, { userId });
  const updateFlagStatus = useMutation(api.teams.updateFlagStatus);

  if (!user || member === undefined || stats === undefined || flags === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">{t("member_profile.member_not_found")}</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 text-primary-600 hover:underline flex items-center gap-2"
        >
          {t("common.dashboard")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <header className="mb-10">
          <nav className="flex items-center gap-2 mb-6 text-xs font-medium text-gray-500">
            <button onClick={() => router.push("/dashboard")} className="hover:text-primary-600 transition-colors">{t("common.dashboard")}</button>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className="text-gray-900 font-semibold">{member.name}</span>
          </nav>
          <div>
            <h1 className="text-2xl font-semibold font-display text-gray-900 tracking-tight">{t("member_profile.title")}</h1>
            <p className="text-sm text-gray-500">{t("member_profile.subtitle")}</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8 mt-6">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="h-24 w-24 rounded-3xl bg-primary-50 border border-primary-100 flex items-center justify-center text-3xl font-bold text-primary-600">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{member.name}</h2>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {member.phone || t("member_profile.no_phone")}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${member.lastActive && (Date.now() - member.lastActive < 60000)
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-gray-50 text-gray-500 border border-gray-100"
                    }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${member.lastActive && (Date.now() - member.lastActive < 60000) ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`}></div>
                    {member.lastActive && (Date.now() - member.lastActive < 60000) ? t("common.active") : t("common.offline")}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center min-w-[120px]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("member_profile.total_clicks")}</p>
                  <p className="text-2xl font-bold text-gray-900 font-display">{stats.totalClicks}</p>
                </div>
                <div className="bg-primary-50/50 rounded-2xl p-4 border border-primary-100 text-center min-w-[120px]">
                  <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1">{t("common.today")}</p>
                  <p className="text-2xl font-bold text-primary-600 font-display">{stats.todayClicks}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Target Progress Section */}
        {activeTarget && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Target className="h-4 w-4" />
                </div>
                {t("member_profile.active_target")}
              </h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                <Clock className="h-3 w-3" />
                {activeTarget.label}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-amber-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Target className="h-32 w-32 text-amber-600 rotate-12" />
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t("dashboard.target")}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900 font-display tracking-tight">{activeTarget.current}</span>
                    <span className="text-sm font-medium text-gray-400 tracking-tight">/ {activeTarget.target}</span>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-amber-600">{activeTarget.percentage}% {t("member_profile.complete")}</span>
                      <span className="text-xs font-medium text-gray-400">
                        {activeTarget.target - activeTarget.current > 0
                          ? `${activeTarget.target - activeTarget.current} ${t("member_profile.more_to_reach")}`
                          : t("member_profile.target_achieved")}
                      </span>
                    </div>
                    <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                        style={{ width: `${activeTarget.percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {t("member_profile.starts")}: {new Date(activeTarget.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      {t("member_profile.ends")}: {new Date(activeTarget.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spam Detection Alerts */}
        {flags && flags.length > 0 && (
          <div className="mb-10 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t("member_profile.security_alerts")}
            </h3>
            {flags.map((flag) => (
              <div
                key={flag._id}
                className={`p-4 sm:p-6 rounded-[2rem] border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all ${flag.status === "problem"
                  ? "bg-red-50 border-red-100 ring-4 ring-red-50/50"
                  : "bg-amber-50 border-amber-100 ring-4 ring-amber-50/50"
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${flag.status === "problem" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                    }`}>
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-bold uppercase tracking-wider ${flag.status === "problem" ? "text-red-700" : "text-amber-700"}`}>
                      {flag.status === "problem" ? t("member_profile.spam_location") : t("member_profile.location_activity")}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {t("member_profile.detected_entries").replace("{count}", flag.count)} ({flag.lat}, {flag.lng}).
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <a
                        href={`https://www.google.com/maps?q=${flag.lat},${flag.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                      >
                        {t("member_profile.view_on_map")} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {flag.status !== "problem" && (
                    <button
                      onClick={() => updateFlagStatus({ flagId: flag._id, status: "problem" })}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {t("member_profile.mark_problem")}
                    </button>
                  )}
                  <button
                    onClick={() => updateFlagStatus({ flagId: flag._id, status: "cleared" })}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t("member_profile.clear_flag")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Logs */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold font-display text-gray-900 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <BarChart3 className="h-4 w-4" />
              </div>
              {t("common.activity")} {activeTarget && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md ml-2">{t("member_profile.filtered_by_target")}</span>}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <History className="h-3.5 w-3.5" />
              {t("member_profile.showing_last_50")}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t("common.timestamp")}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t("common.source")}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t("common.location_details")}</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">{t("common.action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs && logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] font-medium text-gray-400">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${log.source === "direct"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-purple-50 text-purple-700 border border-purple-100"
                            }`}>
                            {log.source === "direct" ? <User className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                            {log.source}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                              <MapPin className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-gray-700">
                                {log.lat?.toFixed(4)}, {log.lng?.toFixed(4)}
                              </span>
                              <span className="text-[10px] text-gray-400">{t("member_profile.verified_gps")}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="h-3 w-3" />
                            {t("common.verified")}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                            <Clock className="h-6 w-6" />
                          </div>
                          <p className="text-sm text-gray-400 font-medium">{t("member_profile.no_activity")}</p>
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
  );
}
