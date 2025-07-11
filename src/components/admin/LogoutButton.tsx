"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/auth";

export default function LogoutButton() {
    const router = useRouter();
    const handleLogout = async () => {
        await logoutAction();
        router.push("/admin/login");
    };

    return (
         <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2" /> Log Out
        </Button>
    )
}
