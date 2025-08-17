// src/components/admin/LogoutButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LogoutButton() {
    const { logout } = useAuth();

    return (
         <Button onClick={logout} variant="outline">
            <LogOut className="mr-2" /> Log Out
        </Button>
    )
}
