"use client";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import {
  Users,
  MousePointer2,
  TrendingUp,
  Target,
  Award,
  Clock,
  ArrowLeft,
  Phone,
  Building2,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  History
} from "lucide-react";

export default function AdminDetailsPage() {
  const router = useRouter();
  const { adminId } = useParams();
  const [storedUser, setStoredUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "super_admin") {
      router.push("/");
    } else {
      setStoredUser(user);
    }
  }, [router]);

  const data = useQuery(api.analytics.getAdminDashboardData, { adminId });

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Admin Insights...</p>
        </div>
      </div>
    );
  }

  const { admin, ulb, members, stats, recentActivity, flags, targets } = data;

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <nav className="flex items-center gap-2 mb-8 text-xs font-medium text-gray-500">
            <button onClick={() => router.push("/super-admin")} className="hover:text-primary-600 transition-colors">Global Overview</button>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className="text-gray-900 font-semibold">{admin.name}</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-4xl font-bold shadow-sm transition-transform hover:scale-105 duration-500">
                {admin.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900 font-display tracking-tight">{admin.name}</h1>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Admin</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-bold bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                    <Phone className="h-3.5 w-3.5 text-emerald-500" />
                    {admin.phone}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-primary-700 font-bold bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-100 shadow-sm">
                    <Building2 className="h-3.5 w-3.5" />
                    {ulb?.name || "Global Tenant"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
               <div className="px-4 py-2 text-right border-r border-gray-50">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Last Sync</p>
                  <p className="text-xs font-bold text-gray-700">Just Now</p>
               </div>
               <div className="px-4 py-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <StatCard 
            title="Managed Members" 
            value={stats.totalMembers} 
            icon={<Users className="h-5 w-5" />} 
            color="primary"
            description="Total team size"
          />
          <StatCard 
            title="Total Feedback" 
            value={stats.totalFeedback.toLocaleString()} 
            icon={<MousePointer2 className="h-5 w-5" />} 
            color="emerald"
            description="Lifetime collection"
          />
          <StatCard 
            title="Today's Clicks" 
            value={stats.todayFeedback} 
            icon={<TrendingUp className="h-5 w-5" />} 
            color="amber"
            description="Active momentum"
          />
          <StatCard 
            title="Security Flags" 
            value={flags.length} 
            icon={<ShieldAlert className="h-5 w-5" />} 
            color="rose"
            description="Problematic locations"
            isWarning={flags.length > 0}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Member List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-semibold text-gray-900 font-display flex items-center gap-2.5">
                <Award className="h-6 w-6 text-primary-600" />
                Member Performance Summary
              </h2>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-50">
                      <tr>
                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Team Member</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Feedback</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {members.map(member => (
                        <tr key={member._id} className="hover:bg-gray-50/50 transition-all duration-300 group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-primary-600 text-sm group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors">
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800 group-hover:text-primary-700 transition-colors">{member.name}</p>
                                <p className="text-[10px] font-mono font-bold text-gray-400">{member.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">{member.clickCount}</span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                              member.status === "active" 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                : "bg-rose-50 text-rose-600 border-rose-100"
                            }`}>
                              <div className={`h-1.5 w-1.5 rounded-full ${member.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                              {member.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-gray-600">
                                  {member.lastActive ? new Date(member.lastActive).toLocaleDateString() : "Never"}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                  {member.lastActive ? new Date(member.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                </span>
                             </div>
                          </td>
                        </tr>
                      ))}
                      {members.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-8 py-20 text-center">
                             <div className="flex flex-col items-center gap-3">
                                <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                                   <Users className="h-8 w-8" />
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No members managed by this admin</p>
                             </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>

          {/* Sidebar: Activity & Flags */}
          <div className="space-y-10">
            {/* Recent Activity */}
            <section className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 font-display flex items-center gap-2.5 px-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Live Activity Log
              </h2>
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                <div className="space-y-6">
                  {recentActivity.map((activity, idx) => (
                    <div key={activity._id} className="flex gap-4 group">
                      <div className="relative flex flex-col items-center">
                         <div className="h-2.5 w-2.5 rounded-full bg-primary-500 ring-4 ring-primary-50 z-10" />
                         {idx !== recentActivity.length - 1 && <div className="absolute top-2.5 bottom-0 w-0.5 bg-gray-100 -mb-6" />}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                           <span className="text-xs font-bold text-gray-800">New Feedback</span>
                           <span className="text-[10px] font-bold text-gray-400 font-mono">{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                          Recorded via <span className="text-primary-600 font-bold">{activity.source}</span> at coordinate cluster.
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <div className="min-h-[300px] text-center flex flex-col items-center justify-center text-gray-400">
                      <History className="h-8 w-8 mb-3 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">Idle System</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Security Alerts */}
            {flags.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 font-display flex items-center gap-2.5 px-2">
                  <ShieldAlert className="h-5 w-5 text-rose-500" />
                  Security Alerts
                </h2>
                <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-8 space-y-4 shadow-sm">
                  {flags.map(flag => (
                    <div key={flag._id} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-rose-100/50">
                       <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                          <AlertTriangle className="h-4 w-4" />
                       </div>
                       <div>
                          <p className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">Spam Cluster Detected</p>
                          <p className="text-[10px] text-rose-600 font-bold mt-0.5">{flag.count} attempts from single location</p>
                       </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, description, isWarning }) {
  const colors = {
    primary: "bg-primary-50 text-primary-600 border-primary-100 shadow-primary-500/10",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/10",
    amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/10",
    rose: "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-500/10",
  };

  return (
    <div className={`bg-white p-7 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-44 transition-all hover:shadow-md hover:-translate-y-1 duration-300 ${isWarning ? "ring-2 ring-rose-500/20" : ""}`}>
      <div className="flex items-center justify-between">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-inner ${colors[color]}`}>
          {icon}
        </div>
        {isWarning && (
          <div className="flex items-center gap-1.5 bg-rose-50 px-2 py-1 rounded-lg">
             <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
             <span className="text-[9px] font-bold text-rose-600 uppercase tracking-widest">Active</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">{title}</p>
        <p className="text-3xl font-semibold text-gray-900 leading-none mb-2 tracking-tight">{value}</p>
        <p className="text-[10px] font-bold text-gray-400 leading-none">{description}</p>
      </div>
    </div>
  );
}
