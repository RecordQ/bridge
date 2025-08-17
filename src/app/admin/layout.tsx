// src/app/admin/layout.tsx
"use client";

import { type ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoaderCircle } from "lucide-react";

function AdminApp({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if authentication has been checked (isAuthLoading is false)
    if (!isAuthLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isAuthLoading, router, pathname]);

  // If auth is loading, always show spinner unless we are on the login page
  if (isAuthLoading && pathname !== '/admin/login') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // Allow login page to be rendered without being authenticated
  if (!isAuthenticated && pathname !== '/admin/login') {
    // This will be caught by the useEffect and redirected, but this prevents flashing of content
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminApp>{children}</AdminApp>
}
