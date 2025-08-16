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
    if (!isAuthLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isAuthLoading, router, pathname]);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const showContent = (isAuthenticated && pathname !== '/admin/login') || pathname === '/admin/login';

  return (
    <>
      {showContent ? children : (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      )}
    </>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminApp>{children}</AdminApp>
}
