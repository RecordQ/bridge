// src/components/layout/PageLayout.tsx
"use client";

import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import ThreeScene from "../ThreeScene";
import { Chatbot } from "../Chatbot";
import { useSiteData } from "@/hooks/useSiteData";

export function PageLayout({ children }: { children: ReactNode }) {
    const { siteData } = useSiteData();
    
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            {siteData?.theme && <ThreeScene />}
            <Header />
            {children}
            <Footer />
            <Chatbot />
        </div>
    );
}
