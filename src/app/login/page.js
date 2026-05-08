"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/context/AuthModalContext";

export default function LoginPage() {
  const router = useRouter();
  const { openAuthModal } = useAuthModal();


  useEffect(() => {
    router.replace("/");
    setTimeout(() => {
      openAuthModal();
    }, 100);
  }, [router, openAuthModal]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );
}
