"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LoaderCircle } from "lucide-react";

function AdminAreaLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If loading is finished and user is not authenticated, redirect to login
        if (!isLoading && !isAuthenticated) {
            router.replace('/admin/login');
        }
    }, [isAuthenticated, isLoading, router]);

    // While checking authentication, show a loading spinner
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    // If authenticated, show the admin content
    if (isAuthenticated) {
         return <>{children}</>;
    }

    // Return null while redirecting
    return null;
}


export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <AdminAreaLayout>{children}</AdminAreaLayout>
        </AuthProvider>
    )
}
