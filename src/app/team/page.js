"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  MousePointer2,
  Loader2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Share2,
  Target
} from "lucide-react";
import { toast } from "sonner";
import ShareModal from "@/components/ShareModal";

export default function TeamPanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isClicking, setIsClicking] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || storedUser.role !== "team") {
      router.push("/login");
    } else {
      setUser(storedUser);
    }
  }, [router]);

  const team = useQuery(api.teams.getTeamById,
    user?.teamId ? { teamId: user.teamId } : "skip"
  );
  const memberStats = useQuery(api.users.getMemberStats,
    user?._id ? { userId: user._id } : "skip"
  );
  const activeTarget = useQuery(api.targets.getActiveTarget,
    user?._id ? { userId: user._id, teamId: user.teamId } : "skip"
  );
  const incrementClick = useMutation(api.teams.incrementClick);
  const updateHeartbeat = useMutation(api.users.updateHeartbeat);

  // Prevent scroll jump and layout shifts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Heartbeat system
  useEffect(() => {
    if (!user?._id) return;

    // Pulse immediately on load
    updateHeartbeat({ userId: user._id });

    const interval = setInterval(() => {
      updateHeartbeat({ userId: user._id });
    }, 20000); // Pulse every 20 seconds

    return () => clearInterval(interval);
  }, [user?._id, updateHeartbeat]);

  const handleTakeFeedback = async () => {
    if (!user?.teamId || !user?._id) return;

    setIsClicking(true);
    try {
      await incrementClick({
        teamId: user.teamId,
        userId: user._id
      });
      toast.success("Feedback tracked successfully! Redirecting...");

      // Delay slightly for toast visibility
      setTimeout(() => {
        window.location.href = "https://cf.sbmurban.org/";
      }, 1000);
    } catch (error) {
      toast.error("Failed to track feedback. Please try again.");
      setIsClicking(false);
    }
  };

  if (!user || team === undefined || memberStats === undefined) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#fcfcfd]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/track?teamId=${user.teamId}&memberId=${user._id}`
    : "";

  const performance = (memberStats?.todayClicks || 0) > 5 ? "Excellent" : (memberStats?.todayClicks || 0) > 0 ? "Good" : "Neutral";

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col items-center p-6 py-16 sm:py-24">
      <div className="w-full max-w-xl text-center space-y-10">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold uppercase tracking-wider">
              <div className={`h-1.5 w-1.5 rounded-full ${performance === 'Excellent' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : performance === 'Good' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
              <span>Performance: {performance}</span>
            </div>
            <h1 className="text-4xl font-semibold font-display text-gray-800 tracking-tight">
              Welcome, <span className="text-primary-600">{user.name}</span>
            </h1>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
              Representing <span className="font-semibold text-gray-800">{team?.name}</span> in <span className="font-semibold text-gray-800 tracking-tight">Ward {team?.ward}</span>
            </p>
          </div>

          {/* Top Summary Stats */}
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Today</p>
              <p className="text-2xl font-bold text-primary-600 font-display">{memberStats?.todayClicks}</p>
            </div>
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-800 font-display">{memberStats?.totalClicks}</p>
            </div>
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ward</p>
              <p className="text-2xl font-bold text-gray-800 font-display">{team?.ward}</p>
            </div>
          </div>
        </div>

        {/* Active Target Card */}
        {activeTarget && (
          <div className="max-w-md mx-auto w-full">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-primary-100 ring-4 ring-primary-50/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target className="h-20 w-20 text-primary-600 rotate-12" />
              </div>

              <div className="relative z-10 text-left">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                      <Target className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{activeTarget.label || "Current Target"}</span>
                  </div>
                  <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                    {activeTarget.percentage}% Done
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold text-gray-800 font-display">{activeTarget.current}</span>
                  <span className="text-sm font-medium text-gray-400 tracking-tight">/ {activeTarget.target} entries achieved</span>
                </div>

                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                    <div
                      className="h-full bg-primary-600 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(37,99,235,0.3)]"
                      style={{ width: `${activeTarget.percentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                    {activeTarget.target - activeTarget.current > 0
                      ? `${activeTarget.target - activeTarget.current} more to reach goal`
                      : "Goal Achieved! 🏆"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Card */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group max-w-md mx-auto w-full">
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-300 group-hover:text-primary-500 transition-colors">
                <MousePointer2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-semibold font-display text-gray-800">Collect Feedback</h2>
                <p className="text-xs text-gray-400 mt-1">Record a new entry manually</p>
              </div>
            </div>

            <button
              disabled={isClicking}
              onClick={handleTakeFeedback}
              className="w-full h-20 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-2xl text-xl font-semibold font-display shadow-lg shadow-primary-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
              {isClicking ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Take Feedback</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl border border-gray-50 text-gray-400 font-semibold text-sm hover:bg-gray-50 hover:text-primary-600 transition-all active:scale-95 bg-gray-50/30"
            >
              <Share2 className="h-4 w-4" />
              Share Link
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-xs text-gray-400 italic">
          After clicking, you will be automatically redirected to the central feedback portal.
        </p>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        trackingUrl={trackingUrl}
        memberName={user.name}
      />
    </div>
  );
}
