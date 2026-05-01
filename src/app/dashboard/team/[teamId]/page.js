"use client";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  Users,
  MapPin,
  MousePointer2,
  Circle,
  Phone,
  BarChart3,
  TrendingUp,
  Target,
  Plus,
  Share2,
  Globe
} from "lucide-react";
import { useEffect, useState } from "react";
import TargetModal from "@/components/TargetModal";

export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId;

  const team = useQuery(api.teams.getTeamById, { teamId });
  const members = useQuery(api.users.getMembersByTeam, { teamId });
  const activeTarget = useQuery(api.targets.getActiveTarget, { teamId });
  const shareAnalytics = useQuery(api.teams.getShareAnalyticsByTeam, { teamId });

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (team === undefined || members === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Team not found</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 text-primary-600 hover:underline flex items-center gap-2"
        >
          Dashboard
        </button>
      </div>
    );
  }

  const activeMembers = members.filter(m => m.lastActive && (currentTime - m.lastActive < 60000)).length;

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <nav className="flex items-center gap-2 mb-4 text-[11px] font-bold uppercase tracking-widest text-gray-400">
              <button onClick={() => router.push("/dashboard")} className="hover:text-primary-600 transition-colors">Dashboard</button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-900">{team.name}</span>
            </nav>
            <h1 className="text-2xl font-semibold font-display text-gray-900 tracking-tight">Team Details</h1>
            <p className="text-sm text-gray-500 font-medium">
              Performance metrics and member status
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsTargetModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-primary-200 hover:bg-primary-50 transition-all text-sm font-semibold text-gray-700 shadow-sm"
            >
              <Target className="h-4 w-4 text-primary-600" />
              {activeTarget ? "Update Target" : "Set Team Target"}
            </button>

            <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">{activeMembers} Members Live</span>
            </div>
          </div>
        </header>

        <TargetModal 
          isOpen={isTargetModalOpen}
          onClose={() => setIsTargetModalOpen(false)}
          teamId={teamId}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          <StatCard
            title="Total Team Clicks"
            value={team.clickCount}
            icon={MousePointer2}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            trend="Real-time tracking"
          />
          
          {activeTarget ? (
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-primary-100 ring-4 ring-primary-50/50 transition-all">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold text-primary-500 uppercase tracking-[0.15em]">{activeTarget.label || "Active Target"}</p>
                  <Target className="h-5 w-5 text-primary-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-gray-800 font-display">{activeTarget.current}</h3>
                  <p className="text-sm font-medium text-gray-400">/ {activeTarget.target} entries</p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-600 transition-all duration-1000" 
                      style={{ width: `${activeTarget.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Progress</span>
                    <span className="text-primary-600">{activeTarget.percentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <StatCard
              title="Team Members"
              value={members.length}
              icon={Users}
              iconColor="text-purple-600"
              iconBg="bg-purple-50"
            />
          )}

          <StatCard
            title="Ward Location"
            value={`Ward ${team.ward}`}
            icon={MapPin}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Member Table Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-semibold font-display text-gray-800 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary-500" />
                Member Performance
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/30">
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Member Name</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Clicks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {members.map((member) => {
                      const isLive = member.lastActive && (currentTime - member.lastActive < 60000);

                      return (
                        <tr 
                          key={member._id} 
                          onClick={() => router.push(`/dashboard/member/${member._id}`)}
                          className="group hover:bg-gray-50/50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isLive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-gray-50 text-gray-500 border border-gray-100"
                              }`}>
                              <div className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`}></div>
                              {isLive ? "Live" : "Offline"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-100 group-hover:border-primary-100 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                                {member.name.charAt(0)}
                              </div>
                              <span className="font-semibold text-gray-800 text-sm group-hover:text-primary-600 transition-colors">{member.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex flex-col items-end">
                              <span className="text-sm font-bold text-gray-800 font-display">
                                {(member.clickCount || 0).toLocaleString()}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
            <div className="mt-3 flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 w-fit">
              <TrendingUp className="h-3 w-3 text-blue-600" />
              <span className="text-[11px] font-semibold text-blue-600">{trend}</span>
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
