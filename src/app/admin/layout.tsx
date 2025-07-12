// src/app/admin/layout.tsx
"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LoaderCircle } from "lucide-react";
import { SiteDataProvider, useSiteData } from "@/hooks/useSiteData";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

function ThemedAdminLayout({ children }: { children: ReactNode }) {
    const { siteData, isLoading: isSiteDataLoading } = useSiteData();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated && pathname !== '/admin/login') {
            router.replace('/admin/login');
        }
    }, [isAuthenticated, isAuthLoading, router, pathname]);

    if (isAuthLoading || isSiteDataLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    const showContent = (isAuthenticated && pathname !== '/admin/login') || pathname === '/admin/login';

    return (
        <div className={cn("min-h-screen bg-background font-body antialiased")}>
            {showContent ? children : (
                <div className="flex h-screen w-full items-center justify-center bg-background">
                    <LoaderCircle className="h-8 w-8 animate-spin" />
                </div>
            )}
            <Toaster />
        </div>
    )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <SiteDataProvider>
            <AuthProvider>
                <ThemedAdminLayout>{children}</ThemedAdminLayout>
            </AuthProvider>
        </SiteDataProvider>
    )
}
