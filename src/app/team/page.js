"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import { MousePointer2, Loader2, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function TeamPanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isClicking, setIsClicking] = useState(false);

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
  const incrementClick = useMutation(api.teams.incrementClick);

  const handleTakeFeedback = async () => {
    if (!user?.teamId) return;
    
    setIsClicking(true);
    try {
      await incrementClick({ teamId: user.teamId });
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

  if (!user || team === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl text-center space-y-10">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold uppercase tracking-wider">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Authenticated Member</span>
          </div>
          <h1 className="text-3xl font-semibold font-display text-gray-800 tracking-tight">
            Welcome, <span className="text-primary-600">{user.name}</span>
          </h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            You are currently representing <span className="font-semibold text-gray-800">{team?.name || "Loading..."}</span> in <span className="font-semibold text-gray-800">Ward {team?.ward}</span>.
          </p>
        </div>

        {/* Action Card */}
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden group">
          <div className="relative z-10 space-y-10">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-50 text-gray-400 group-hover:text-primary-500 transition-colors">
                <MousePointer2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-semibold font-display text-gray-800">Collect Feedback</h2>
                <p className="text-xs text-gray-500 mt-1">Record a new entry for your team</p>
              </div>
            </div>

            <button
              disabled={isClicking}
              onClick={handleTakeFeedback}
              className="w-full h-20 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl text-xl font-semibold font-display shadow-md shadow-primary-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
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
            
            <div className="flex items-center justify-center gap-6 text-[11px] text-gray-400 font-bold uppercase tracking-widest pt-4 border-t border-gray-50">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Ward {team?.ward}
              </div>
              <div className="h-3 w-px bg-gray-100"></div>
              <div className="flex items-center gap-1.5">
                <MousePointer2 className="h-3.5 w-3.5" />
                {team?.clickCount} Entries
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-xs text-gray-400 italic">
          After clicking, you will be automatically redirected to the central feedback portal.
        </p>
      </div>
    </div>
  );
}
