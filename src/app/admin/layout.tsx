// src/app/admin/layout.tsx
"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoaderCircle } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth is done loading and user is not authenticated,
    // and they aren't already on the login page, redirect them.
    if (!isAuthLoading && !isAuthenticated && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, isAuthLoading, router, pathname]);

  // While checking auth status, show a loader.
  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If authenticated, or on the login page, render the children.
  // This prevents a flash of protected content before redirect.
  if (isAuthenticated || pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Fallback for unauthenticated users, the useEffect will handle the redirect.
  return null;
}
