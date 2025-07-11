"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LoaderCircle } from "lucide-react";

function AdminLayoutContent({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // If loading has finished, and we are not on the login page, and the user is not authenticated...
        if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
            // ...redirect to the login page.
            router.replace('/admin/login');
        }
    }, [isAuthenticated, isLoading, router, pathname]);

    // While checking authentication, show a loading spinner
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    // If on a protected route and authenticated, show the content.
    // Or, if on the login page, show the content (the login page itself).
    if ((isAuthenticated && pathname !== '/admin/login') || pathname === '/admin/login') {
         return <>{children}</>;
    }

    // In other cases (like being unauthenticated on a protected route and waiting for redirect),
    // return null or a loader to prevent flashing content.
    return (
      <div className="flex h-screen w-full items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AuthProvider>
    )
}
