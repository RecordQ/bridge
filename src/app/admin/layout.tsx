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
    // If authentication is done loading and the user is not authenticated,
    // and they are trying to access a page other than the login page, redirect them.
    if (!isAuthLoading && !isAuthenticated && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, isAuthLoading, router, pathname]);

  // While checking auth, show a loader for any page except the login page.
  // The login page should render immediately.
  if (isAuthLoading && pathname !== "/admin/login") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If the user is authenticated OR they are on the login page, render the children.
  // This prevents a flash of protected content for unauthenticated users before the redirect.
  if (isAuthenticated || pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Fallback loader for the brief moment before the redirect effect runs for unauthenticated users.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <LoaderCircle className="h-8 w-8 animate-spin" />
    </div>
  );
}
