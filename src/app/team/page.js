"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  MousePointer2,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Share2,
  Target,
  BarChart3,
  Zap,
  History
} from "lucide-react";
import { toast } from "sonner";
import ShareModal from "@/components/ShareModal";
import { useLanguage } from "@/context/LanguageContext";

export default function TeamPanel() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [isClicking, setIsClicking] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || storedUser.role !== "team") {
      router.push("/");
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
  const createPendingClick = useMutation(api.teams.createPendingClick);
  const updateHeartbeat = useMutation(api.users.updateHeartbeat);

  useEffect(() => {
    if (!user?._id) return;
    updateHeartbeat({ userId: user._id });
    const interval = setInterval(() => {
      updateHeartbeat({ userId: user._id });
    }, 20000);
    return () => clearInterval(interval);
  }, [user?._id, updateHeartbeat]);

  const handleTakeFeedback = async () => {
    if (!user?._id) return;
    setIsClicking(true);
    
    let location = { lat: undefined, lng: undefined };
    try {
      if ("geolocation" in navigator) {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      }
    } catch (error) {
      console.warn("Geolocation failed:", error);
    }

    try {
      const pendingId = await createPendingClick({
        teamId: user.teamId,
        userId: user._id,
        lat: location.lat,
        lng: location.lng,
        source: "direct"
      });
      toast.success(t("portal.loading"));
      setTimeout(() => {
        router.push(`/portal?pendingId=${pendingId}`);
      }, 1000);
    } catch (error) {
      toast.error("Failed to track feedback.");
      setIsClicking(false);
    }
  };

  const isLoading = !user || (user.teamId && team === undefined) || (memberStats === undefined);

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#fcfcfd]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/track?memberId=${user._id}`
    : "";

  const performance = (memberStats?.todayClicks || 0) > 5 ? t("team_panel.excellent") : (memberStats?.todayClicks || 0) > 0 ? t("team_panel.good") : t("team_panel.neutral");

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
        <div className="mx-auto max-w-2xl space-y-10">
          
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 shadow-sm text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <div className={`h-2 w-2 rounded-full ${performance === 'Excellent' ? 'bg-emerald-500 animate-pulse' : performance === 'Good' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              {t("common.activity")}: {performance}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 tracking-tight">
              {t("team_panel.welcome")} <span className="text-primary-600">{user.name}</span>
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {team ? `${t("team_panel.representing")} ${team.name} • ${t("team_panel.ward")} ${team.ward}` : t("team_panel.subtitle")}
            </p>
          </div>

          {/* Action Card */}
          <div className="bg-white p-8 sm:p-12 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:rotate-0 transition-all duration-500 pointer-events-none">
              <MousePointer2 className="h-32 w-32 text-primary-600" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center space-y-10">
              <div className="text-center space-y-2">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
                  <MousePointer2 className="h-8 w-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-display tracking-tight">{t("team_panel.take_feedback")}</h2>
                <p className="text-xs sm:text-sm text-gray-500 max-w-[280px] mx-auto leading-relaxed font-medium">{t("team_panel.subtitle")}</p>
              </div>

              <div className="w-full space-y-4">
                <button
                  disabled={isClicking}
                  onClick={handleTakeFeedback}
                  className="w-full h-20 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-[2rem] text-xl font-bold font-display transition-all active:scale-[0.98] flex items-center justify-center gap-3 group/btn"
                >
                  {isClicking ? (
                    <>
                      <Loader2 className="h-7 w-7 animate-spin" />
                      <span>{t("common.loading")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("team_panel.take_feedback")}</span>
                      <ArrowRight className="h-6 w-6 group-hover/btn:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </button>

                <div className="pt-2">
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-500 font-bold text-xs hover:bg-white hover:text-primary-600 hover:border-primary-100 transition-all active:scale-95"
                  >
                    <Share2 className="h-4 w-4" />
                    {t("dashboard.share_link")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push("/team/logs")}
              className="text-left h-full"
            >
              <SummaryCard 
                label={t("team_panel.today_stats")} 
                value={memberStats?.todayClicks} 
                icon={Zap} 
                color="text-amber-600" 
                bg="bg-amber-50"
                border="border-amber-100"
                t={t}
              />
            </button>
            <button 
              onClick={() => router.push("/team/logs")}
              className="text-left h-full"
            >
              <SummaryCard 
                label={t("team_panel.feedback_collected")} 
                value={memberStats?.totalClicks} 
                icon={BarChart3} 
                color="text-primary-600" 
                bg="bg-primary-50"
                border="border-primary-100"
                t={t}
              />
            </button>
            <button 
              onClick={() => router.push("/team/logs")}
              className={`text-left h-full relative overflow-hidden bg-white rounded-3xl p-6 border transition-all shadow-sm group hover:border-emerald-200 flex flex-col justify-between ${activeTarget ? 'border-emerald-100 bg-emerald-50/20' : 'border-gray-100'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("member_profile.active_target")}</p>
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${activeTarget ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-300'}`}>
                  <Target className="h-4 w-4" />
                </div>
              </div>
              {activeTarget ? (
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900 font-display">{activeTarget.current}</span>
                    <span className="text-xs font-medium text-gray-400">/ {activeTarget.target}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-emerald-50">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                        style={{ width: `${Math.min(activeTarget.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">{activeTarget.percentage}% {t("member_profile.complete")}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{activeTarget.label}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[64px] flex items-center justify-center">
                  <p className="text-xs text-gray-400 font-medium italic">{t("dashboard.no_target")}</p>
                </div>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 font-medium italic">
            {t("tracking.secure_geo")}
          </p>
        </div>
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

function SummaryCard({ label, value, icon: Icon, color, bg, border, t }) {
  return (
    <div className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-sm group hover:border-gray-200 transition-all h-full flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${bg} ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-gray-900 font-display tracking-tight">
          {value?.toLocaleString() || 0}
        </h3>
        <span className="text-[10px] font-bold text-gray-400 uppercase">{t("member_profile.entries")}</span>
      </div>
    </div>
  );
}
