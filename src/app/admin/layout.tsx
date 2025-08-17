// src/app/admin/layout.tsx
"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoaderCircle } from "lucide-react";

function AdminApp({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth state is done loading and user is not authenticated,
    // and they are not already on the login page, redirect them.
    if (!isAuthLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isAuthLoading, router, pathname]);

  // While checking auth, show a loader unless we're on the login page.
  // The login page can be rendered without waiting for auth check.
  if (isAuthLoading && pathname !== '/admin/login') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // If not authenticated and trying to access a protected page,
  // this prevents a flash of content before the redirect in the useEffect.
  // The layout will just show a loader until the redirect happens.
  if (!isAuthenticated && pathname !== '/admin/login') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // If we get here, the user is either authenticated or is on the login page.
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminApp>{children}</AdminApp>
}
