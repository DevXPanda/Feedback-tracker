"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Suspense } from "react";

export default function TrackPage() {
  return (
    <Suspense fallback={null}>
      <TrackContent />
    </Suspense>
  );
}

function TrackContent() {
  const searchParams = useSearchParams();
  const recordSharedClick = useMutation(api.teams.recordSharedClick);

  useEffect(() => {
    let redirected = false;

    // 1. Build redirect URL preserving all params
    const redirectUrl = new URL("https://cf.sbmurban.org/");
    searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });
    
    // Use existing source or default to "shared"
    const source = searchParams.get("source") || "shared";
    redirectUrl.searchParams.set("source", source);

    const doRedirect = () => {
      if (redirected) return;
      redirected = true;
      // Instantly redirect without adding to history
      window.location.replace(redirectUrl.toString());
    };

    // 2. Failsafe: Guarantee redirect within 400ms even if tracking is slow
    const failsafeTimer = setTimeout(() => {
      doRedirect();
    }, 400);

    // 3. Track click asynchronously and immediately
    const track = async () => {
      const rawMemberId = searchParams.get("teamMemberId") || searchParams.get("memberId") || searchParams.get("m");
      const rawUserId = searchParams.get("userId") || searchParams.get("u_id");
      const teamId = searchParams.get("teamId") || searchParams.get("t");
      const ulbId = searchParams.get("ulbId") || searchParams.get("u");

      if (!rawMemberId && !rawUserId) {
        doRedirect();
        return;
      }

      if (!ulbId) {
        doRedirect();
        return;
      }

      try {
        // 1. Get or create a session-based fingerprint
        let fingerprint = sessionStorage.getItem("feedback_fingerprint");
        if (!fingerprint) {
          fingerprint = Math.random().toString(36).substring(2) + Date.now().toString(36);
          sessionStorage.setItem("feedback_fingerprint", fingerprint);
        }

        // 2. Record the click immediately
        await recordSharedClick({
          teamId: teamId || undefined,
          teamMemberId: rawMemberId || undefined,
          userId: rawUserId || undefined,
          ulbId: ulbId,
          source: source,
          fingerprint: fingerprint
        });
        
        doRedirect();
      } catch (error) {
        console.error("Tracking failed", error);
        doRedirect();
      }
    };

    track();

    return () => clearTimeout(failsafeTimer);
  }, [searchParams, recordSharedClick]);

  // 4. Return null to render absolutely no intermediate UI
  return null;
}
