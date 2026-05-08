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
  const createPendingClick = useMutation(api.teams.createPendingClick);

  useEffect(() => {
    let redirected = false;

    // 1. Build redirect URL preserving all params
    const redirectUrl = new URL("https://cf.sbmurban.org/");
    searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });
    redirectUrl.searchParams.set("source", "shared");

    const doRedirect = (trackingId) => {
      if (redirected) return;
      redirected = true;
      if (trackingId) {
        redirectUrl.searchParams.set("trackingId", trackingId);
      }
      // Instantly redirect without adding to history
      window.location.replace(redirectUrl.toString());
    };

    // 2. Failsafe: Guarantee redirect within 300ms
    const failsafeTimer = setTimeout(() => {
      doRedirect();
    }, 300);

    // 3. Track click asynchronously
    const track = async () => {
      const teamId = searchParams.get("teamId");
      const teamMemberId = searchParams.get("teamMemberId") || searchParams.get("memberId") || searchParams.get("userId");
      const ulbId = searchParams.get("ulbId");

      if ((!teamMemberId && !teamId) || !ulbId) {
        doRedirect();
        return;
      }

      try {
        const pendingId = await createPendingClick({
          teamId: teamId || undefined,
          teamMemberId: teamMemberId || undefined,
          ulbId: ulbId,
          source: "shared"
        });
        
        doRedirect(pendingId);
      } catch (error) {
        console.error("Silent tracking failed", error);
        doRedirect();
      }
    };

    track();

    return () => clearTimeout(failsafeTimer);
  }, [searchParams, createPendingClick]);

  // 4. Return null to render absolutely no intermediate UI or blank screens
  return null;
}
