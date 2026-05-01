"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loader2, ShieldCheck, ExternalLink } from "lucide-react";
import { Suspense } from "react";

export default function PortalPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-primary-400" />
      </div>
    }>
      <PortalContent />
    </Suspense>
  );
}

function PortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pendingId = searchParams.get("pendingId");
  const updateHeartbeat = useMutation(api.teams.updateVisitorHeartbeat);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (!pendingId) return;

    // Send heartbeat immediately
    updateHeartbeat({ pendingId });

    // Send heartbeat every 10 seconds to keep session valid
    const interval = setInterval(() => {
      updateHeartbeat({ pendingId });
    }, 10000);

    return () => clearInterval(interval);
  }, [pendingId, updateHeartbeat]);

  if (!pendingId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-gray-800">Invalid Session</h1>
        <button onClick={() => router.push("/")} className="mt-4 text-primary-600 hover:underline">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-[9999]">
      {/* Top Bar for status */}
      <div className="h-12 bg-gray-900 text-white flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Secure Session Active
          </span>
        </div>
        {!iframeLoaded && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin text-primary-400" />
            <span className="text-[10px] font-medium text-gray-300">Loading feedback portal...</span>
          </div>
        )}
        <div className="flex items-center gap-4">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <a 
            href="https://cf.sbmurban.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-bold uppercase tracking-widest hover:text-primary-400 transition-colors flex items-center gap-1.5"
          >
            Open Original <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Main Content (Iframe) */}
      <div className="flex-1 relative bg-gray-50">
        <iframe
          src="https://cf.sbmurban.org/"
          className="w-full h-full border-none"
          title="Feedback Portal"
          onLoad={() => setIframeLoaded(true)}
          sandbox="allow-forms allow-scripts allow-same-origin"
        />
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#fcfcfd]">
             <div className="flex flex-col items-center gap-4">
               <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
               <p className="text-sm font-medium text-gray-500">Connecting to secure feedback server...</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
