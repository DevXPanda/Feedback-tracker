"use client";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, 
  History, 
  MapPin, 
  User, 
  Globe, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Phone
} from "lucide-react";

export default function MemberLogs() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || storedUser.role !== "team") {
      router.push("/");
    } else {
      setUser(storedUser);
    }
  }, [router]);

  const stats = useQuery(api.users.getMemberStats, 
    user?._id ? { userId: user._id } : "skip"
  );
  const logs = useQuery(api.users.getMemberLogs, 
    user?._id ? { userId: user._id } : "skip"
  );

  if (!user || logs === undefined || stats === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfd]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <header className="mb-10">
          <nav className="flex items-center gap-2 mb-6 text-xs font-medium text-gray-500">
            <button onClick={() => router.push("/team")} className="hover:text-primary-600 transition-colors">Dashboard</button>
            <ChevronRight className="h-3 w-3 text-gray-300" />
            <span className="text-gray-900 font-semibold">Activity Logs</span>
          </nav>
          
          <div>
            <h1 className="text-2xl font-semibold font-display text-gray-900 tracking-tight">Personal Activity logs</h1>
            <p className="text-sm text-gray-500">Detailed performance and activity tracking</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8 mt-6">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="h-24 w-24 rounded-3xl bg-primary-50 border border-primary-100 flex items-center justify-center text-3xl font-bold text-primary-600">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {user.phone || "No phone added"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${user.lastActive && (Date.now() - user.lastActive < 60000)
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-gray-50 text-gray-500 border border-gray-100"
                    }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${user.lastActive && (Date.now() - user.lastActive < 60000) ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`}></div>
                    {user.lastActive && (Date.now() - user.lastActive < 60000) ? "Active Now" : "Currently Offline"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center min-w-[120px]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Clicks</p>
                  <p className="text-2xl font-bold text-gray-900 font-display">{stats.totalClicks}</p>
                </div>
                <div className="bg-primary-50/50 rounded-2xl p-4 border border-primary-100 text-center min-w-[120px]">
                  <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1">Today</p>
                  <p className="text-2xl font-bold text-primary-600 font-display">{stats.todayClicks}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Activity Table */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold font-display text-gray-900 flex items-center gap-2.5 px-1">
            <div className="h-8 w-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <History className="h-4 w-4" />
            </div>
            Recent Activities
          </h2>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Source</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Location Details</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">
                              {new Date(log._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] font-medium text-gray-400">
                              {new Date(log._creationTime).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                              log.source === "direct" 
                                ? "bg-blue-50 text-blue-700 border border-blue-100" 
                                : "bg-purple-50 text-purple-700 border border-purple-100"
                            }`}>
                              {log.source === "direct" ? <User className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                              {log.source}
                            </div>
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
                              <span className="text-[10px] text-gray-400">Verified GPS Coordinates</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                            <AlertCircle className="h-6 w-6" />
                          </div>
                          <p className="text-sm text-gray-400 font-medium">No activity recorded yet</p>
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
