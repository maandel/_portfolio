"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Hitting a protected endpoint to verify our HttpOnly cookie is valid
        await api.getUsersCMS();
        router.replace("/admin/dashboard");
      } catch {
        router.replace("/admin/login");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-sm text-text-muted">Resolving admin session...</span>
      </div>
    </div>
  );
}
