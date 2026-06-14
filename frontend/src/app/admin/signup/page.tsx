"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminSignupRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-mono text-sm">
      <span>Redirecting to login gateway...</span>
    </div>
  );
}
