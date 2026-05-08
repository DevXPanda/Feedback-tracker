"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loader2, MapPin, Globe } from "lucide-react";
import { Suspense } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function TrackPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfd]">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    }>
      <TrackContent t={t} />
    </Suspense>
  );
}

function TrackContent({ t }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const createPendingClick = useMutation(api.teams.createPendingClick);
  const [status, setStatus] = useState(t("common.loading"));

  useEffect(() => {
    const track = async () => {
      const teamId = searchParams.get("teamId");
      const memberId = searchParams.get("memberId") || searchParams.get("userId");
      const ulbId = searchParams.get("ulbId");

      if (!teamId && !memberId) {
        setStatus(t("tracking.invalid_link"));
        return;
      }

      if (!ulbId) {
        setStatus("Invalid Tenant Context");
        return;
      }

      setStatus(t("tracking.location_status"));
      
      let location = { lat: undefined, lng: undefined };
      try {
        if ("geolocation" in navigator) {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            });
          });
          location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
        }
      } catch (error) {
        console.warn("Geolocation failed or denied:", error);
      }

      setStatus(t("portal.loading"));
      try {
        const pendingId = await createPendingClick({
          teamId: teamId || undefined,
          teamMemberId: memberId || undefined,
          ulbId: ulbId,
          lat: location.lat,
          lng: location.lng,
          source: "shared"
        });
        setStatus(t("tracking.redirecting"));
        router.push(`/portal?pendingId=${pendingId}`);
      } catch (error) {
        console.error("Tracking failed:", error);
        setStatus(t("common.redirecting_anyway"));
        setTimeout(() => {
          window.location.href = "https://cf.sbmurban.org/";
        }, 2000);
      }
    };

    track();
  }, [searchParams, createPendingClick, router, t]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fcfcfd] p-6 text-center">
      <div className="relative mb-8">
        <div className="h-20 w-20 rounded-3xl bg-primary-50 flex items-center justify-center text-primary-600 animate-pulse">
          <Globe className="h-10 w-10" />
        </div>
        <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center text-primary-600 border border-primary-50">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </div>
      
      <h1 className="text-2xl font-semibold font-display text-gray-900 mb-2">
        {t("landing.nav_title")}
      </h1>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed animate-pulse">
        {status}
      </p>
      
      <div className="mt-12 flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100">
        <MapPin className="h-3 w-3 text-gray-400" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {t("tracking.secure_geo")}
        </span>
      </div>
    </div>
  );
}
