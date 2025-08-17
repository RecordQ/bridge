// src/components/layout/PageLayout.tsx
"use client";

import type { ReactNode } from "react";
import { Chatbot } from "../Chatbot";
import { ThreeScene } from "../ThreeScene";
import { Header } from "./Header";

export function PageLayout({ children }: { children: ReactNode }) {
    
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            <ThreeScene />
            <Header />
            <div className="pt-16">
                {children}
            </div>
            <Chatbot />
        </div>
    );
}