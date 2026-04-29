"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Loader2 } from "lucide-react";

export default function TrackingPage() {
  const searchParams = useSearchParams();
  const incrementClick = useMutation(api.teams.incrementClick);

  useEffect(() => {
    const trackAndRedirect = async () => {
      const teamId = searchParams.get("teamId");
      const userId = searchParams.get("userId");

      if (teamId) {
        // We fire the mutation but don't wait for it if we want maximum speed,
        // although waiting ensures the record is saved.
        // Let's fire it and redirect.
        incrementClick({ 
          teamId: teamId, 
          userId: userId || undefined 
        }).catch(err => console.error("Tracking failed:", err));
      }

      // Instant redirect
      window.location.replace("https://cf.sbmurban.org/");
    };

    trackAndRedirect();
  }, [searchParams, incrementClick]);

  return null;
}
